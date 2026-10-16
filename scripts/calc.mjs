// Cálculos puros (sem dependência do Foundry), para poder testar fora dele.
import {
  RANK_STEPS, BERCOS, RAIZES, TRAJETORIAS, PERICIAS, ACOES, GAMBITO_NIVEIS, TIERS, TIPOS_ABALO
} from "./data.mjs";

export const DEFAULTS = Object.freeze({
  origem: {
    berco: "", raizes: "", trajetoria: "", circuloFamiliar: "",
    oculta: false, rankDeclarado: 0, circuloDeclarado: ""
  },
  marca: { valor: "", medo: "" },
  gambitos: {},
  atributoMental: "auto",
  compostura: null,
  pr: null,
  usados: {},
  pose: false,
  tier: "comum",
  defesas: {}
});

/** Junta os flags do ator com os valores padrão. */
export function readData(flags) {
  const f = flags ?? {};
  return {
    origem: { ...DEFAULTS.origem, ...(f.origem ?? {}) },
    marca: { ...DEFAULTS.marca, ...(f.marca ?? {}) },
    gambitos: { ...(f.gambitos ?? {}) },
    atributoMental: f.atributoMental || "auto",
    compostura: f.compostura ?? null,
    pr: f.pr ?? null,
    usados: { ...(f.usados ?? {}) },
    pose: !!f.pose,
    tier: TIERS[f.tier] ? f.tier : "comum",
    defesas: { ...(f.defesas ?? {}) }
  };
}

export const abaloDados = (nivel) => 1 + (nivel >= 5) + (nivel >= 11) + (nivel >= 17);
export const gambitosPermitidos = (nivel) => GAMBITO_NIVEIS.filter((n) => nivel >= n).length;
export const fmt = (n) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);

function moverRank(rank, passos) {
  const i = Math.max(0, RANK_STEPS.indexOf(rank));
  return RANK_STEPS[Math.min(RANK_STEPS.length - 1, Math.max(0, i + passos))];
}

/** Resolve a Origem em Rank, Dons ativos, Cicatrizes, resistências e vulnerabilidades. */
export function computeOrigin(origem) {
  const berco = BERCOS[origem.berco] ?? null;
  const raizes = RAIZES[origem.raizes] ?? null;
  const traj = TRAJETORIAS[origem.trajetoria] ?? null;

  const rankBerco = berco?.rank ?? 0;
  const rankReal = moverRank(rankBerco, traj?.passos ?? 0);
  const rankDeclarado = RANK_STEPS.includes(Number(origem.rankDeclarado)) ? Number(origem.rankDeclarado) : 0;
  const oculta = !!origem.oculta;
  const rank = oculta ? rankDeclarado : rankReal;
  const donsAtivos = !oculta;

  const dons = [];
  const addDom = (fonte, d) => d && dons.push({ ...d, fonte, ativo: donsAtivos, once: !!d.once });
  addDom("Berço", berco?.dom);
  addDom("Raízes", raizes?.dom);
  addDom("Trajetória", traj?.dom);

  const cicatrizes = [];
  if (berco?.cicatriz) cicatrizes.push({ fonte: "Berço", texto: berco.cicatriz });
  if (traj?.cicatriz) cicatrizes.push({ fonte: "Trajetória", texto: traj.cicatriz });

  const resiste = new Set([...(berco?.resiste ?? []), ...(raizes?.resiste ?? [])]);
  const vulnera = new Set([...(berco?.vulnera ?? [])]);

  const avisos = [];
  if (origem.trajetoria === "exilio" && origem.berco === "miseravel")
    avisos.push("Exílio ou Fuga não pode ser escolhido por quem nasceu Miserável.");
  if (origem.trajetoria === "reinvencao" && !oculta)
    avisos.push("Reinvenção usa a Origem Oculta: marque \"Segredo guardado\" para valer o Rank declarado.");
  if (traj?.nota) avisos.push(traj.nota);

  return {
    berco, raizes, traj,
    rankBerco, rankReal, rankDeclarado, rank, oculta, donsAtivos,
    dons, cicatrizes, resiste, vulnera, avisos,
    circulo: oculta ? (origem.circuloDeclarado || "—") : (raizes?.circulo ?? "—"),
    bonusCompostura: donsAtivos ? (traj?.bonusCompostura ?? 0) : 0,
    temDom: (id) => donsAtivos && dons.some((d) => d.id === id)
  };
}

/** Estado de defesa de um tipo de Abalo: normal | vuln | res | imune. */
export function estadoDefesa(tipo, origin, defesasManuais) {
  const manual = defesasManuais?.[tipo];
  if (manual) return manual;
  if (!origin) return "normal";
  const r = origin.resiste.has(tipo);
  const v = origin.vulnera.has(tipo);
  if (r && v) return "normal";
  return r ? "res" : v ? "vuln" : "normal";
}

export function aplicarDefesa(total, estado) {
  if (estado === "vuln") return total * 2;
  if (estado === "res") return Math.floor(total / 2);
  if (estado === "imune") return 0;
  return total;
}

function mapaDefesas(origin, manuais) {
  const out = {};
  for (const t of Object.keys(TIPOS_ABALO)) out[t] = estadoDefesa(t, origin, manuais);
  return out;
}

/**
 * Estatísticas de um personagem.
 * snapshot = { level, prof, abilities: {cha:{mod},...}, skills: {per:{total},...} }
 */
export function computeStats(snapshot, data) {
  const mod = (k) => snapshot.abilities?.[k]?.mod ?? 0;
  const nivel = snapshot.level ?? 1;
  const prof = snapshot.prof ?? 2;

  const mental = data.atributoMental === "int" ? mod("int")
    : data.atributoMental === "wis" ? mod("wis")
    : Math.max(mod("int"), mod("wis"));
  const mentalLabel = data.atributoMental === "int" ? "INT" : data.atributoMental === "wis" ? "SAB"
    : (mod("int") > mod("wis") ? "INT" : "SAB");

  const origin = computeOrigin(data.origem);

  const partes = [
    { label: "Base", valor: 8 },
    { label: "CAR", valor: mod("cha") },
    { label: mentalLabel, valor: mental },
    { label: "Rank", valor: origin.rank },
    { label: "2 × Proficiência", valor: 2 * prof }
  ];
  if (origin.bonusCompostura) partes.push({ label: "Raiz firme", valor: origin.bonusCompostura });
  const compostura = partes.reduce((s, p) => s + p.valor, 0);

  const melhorMod = Math.max(mod("int"), mod("wis"), mod("cha"));
  const resolucao = 10 + melhorMod + prof;
  const poseBonus = 4 + (origin.temDom("calma") ? 2 : 0);
  const resolucaoPose = resolucao + poseBonus;
  const resolucaoAtual = data.pose ? resolucaoPose : resolucao;
  const resolucaoLinhagem = origin.temDom("linhagem") ? resolucaoAtual + 2 : null;

  const dados = abaloDados(nivel);
  const montaAbalo = (pericia) => {
    const m = mod(PERICIAS[pericia].ability);
    return `${dados}d6${m === 0 ? "" : m > 0 ? `+${m}` : `−${Math.abs(m)}`}`.replace("−", "-");
  };

  const acoes = ACOES.map((a) => ({
    ...a,
    pericias: a.pericias.map((k) => {
      const bonus = snapshot.skills?.[k]?.total ?? mod(PERICIAS[k].ability);
      const m = mod(PERICIAS[k].ability);
      return {
        key: k, label: PERICIAS[k].label, bonus, bonusFmt: fmt(bonus),
        abalo: montaAbalo(k), formulaAbalo: `${dados}d6 ${m < 0 ? "-" : "+"} ${Math.abs(m)}`
      };
    })
  }));

  return {
    npc: false, nivel, prof,
    compostura: { max: compostura, partes },
    resolucao, resolucaoPose, resolucaoAtual, resolucaoLinhagem,
    abaloDados: dados,
    prMax: prof,
    gambitosPermitidos: gambitosPermitidos(nivel),
    origin, acoes,
    defesas: mapaDefesas(origin, data.defesas),
    lerMesaBonus: snapshot.skills?.ins?.total ?? mod("wis")
  };
}

/** NPCs usam a tabela de tiers do documento. */
export function computeNpcStats(data) {
  const t = TIERS[data.tier] ?? TIERS.comum;
  return {
    npc: true, tier: t,
    compostura: { max: t.compostura, partes: [{ label: t.label, valor: t.compostura }] },
    resolucao: t.resolucao, resolucaoPose: t.resolucao + 4,
    resolucaoAtual: data.pose ? t.resolucao + 4 : t.resolucao,
    resolucaoLinhagem: null, prMax: 0, gambitosPermitidos: 0, acoes: [], origin: null,
    defesas: mapaDefesas(null, data.defesas)
  };
}

/** Compostura atual, com limite entre 0 e o máximo (padrão: cheia). */
export function composturaAtual(data, max) {
  const v = data.compostura;
  if (v === null || v === undefined || v === "") return max;
  return Math.max(0, Math.min(Number(v), max));
}

export function prAtual(data, max) {
  const v = data.pr;
  if (v === null || v === undefined || v === "") return max;
  return Math.max(0, Math.min(Number(v), max));
}
