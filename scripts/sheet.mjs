// Ficha de Embate Social (ApplicationV2 do Foundry v13).
import {
  MODULE_ID, BERCOS, RAIZES, TRAJETORIAS, RANK_STEPS, RANK_LABELS, TIPOS_ABALO, DEFESA_ESTADOS,
  ACOES_APOIO, REACOES, GAMBITOS, TIERS, ATRIBUTOS
} from "./data.mjs";
import { composturaAtual, prAtual, aplicarDefesa, fmt } from "./calc.mjs";
import { dadosDe, statsFor } from "./actor.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

const TEMPLATE = `modules/${MODULE_ID}/templates/sheet.hbs`;
const FLAG = `flags.${MODULE_ID}`;

const opcoes = (tabela, atual, vazio) => {
  const out = Object.entries(tabela).map(([value, v]) => ({
    value, label: v.label + (v.exemplos ? ` (${v.exemplos})` : ""), selected: value === atual
  }));
  if (vazio) out.unshift({ value: "", label: vazio, selected: !atual });
  return out;
};

export class EmbateSheet extends HandlebarsApplicationMixin(ApplicationV2) {
  static instances = new Map();

  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["embate-social"],
    position: { width: 780, height: 780 },
    window: { icon: "fa-solid fa-masks-theater", resizable: true },
    form: { handler: EmbateSheet.#onSubmit, submitOnChange: true, closeOnSubmit: false },
    actions: {
      tab: EmbateSheet.#onTab,
      rollAcao: EmbateSheet.#onRollAcao,
      rollCheck: EmbateSheet.#onRollCheck,
      recompor: EmbateSheet.#onRecompor,
      sofrer: EmbateSheet.#onSofrer,
      curar: EmbateSheet.#onCurar,
      usarGambito: EmbateSheet.#onUsarGambito,
      novoEmbate: EmbateSheet.#onNovoEmbate
    }
  };

  static PARTS = { main: { template: TEMPLATE } };

  #tab = "resumo";
  #ui = { vantagem: false, desvantagem: false, circulo: false, valor: false, dom: false, cicatriz: false, extra: 0, medo: false, dobrar: false, maximo: false };

  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
  }

  get title() {
    return `Embate Social — ${this.actor.name}`;
  }

  static open(actor) {
    let app = this.instances.get(actor.uuid);
    if (!app) {
      app = new this(actor, { id: `${MODULE_ID}-${actor.id}` });
      this.instances.set(actor.uuid, app);
    }
    app.render({ force: true });
    app.bringToFront?.();
    return app;
  }

  async close(options) {
    EmbateSheet.instances.delete(this.actor.uuid);
    return super.close(options);
  }

  // ------------------------------------------------------------ contexto

  async _prepareContext() {
    const actor = this.actor;
    const data = dadosDe(actor);
    const stats = statsFor(actor);
    const isNpc = stats.npc;
    const editable = actor.isOwner;

    const max = stats.compostura.max;
    const atual = composturaAtual(data, max);
    const prMax = stats.prMax;
    const pr = prAtual(data, prMax);

    const o = stats.origin;
    const origem = data.origem;

    const gambitosEscolhidos = GAMBITOS.filter((g) => data.gambitos[g.id]);
    const permitidos = stats.gambitosPermitidos;

    const defesas = Object.entries(TIPOS_ABALO).map(([tipo, label]) => ({
      tipo, label,
      estado: stats.defesas[tipo],
      estadoLabel: DEFESA_ESTADOS[stats.defesas[tipo]],
      opcoes: Object.entries(DEFESA_ESTADOS).map(([value, l]) => ({ value, label: l, selected: value === (data.defesas[tipo] ?? "") }))
    }));

    const usado = (id) => !!data.usados[id];

    return {
      editable, isNpc,
      tabResumo: this.#tab === "resumo",
      tabAcoes: this.#tab === "acoes",
      tabGambitos: this.#tab === "gambitos",
      tabOrigem: this.#tab === "origem",
      actor: { name: actor.name, img: actor.img },
      stats,
      nivel: stats.nivel,
      compostura: { atual, max, pct: max ? Math.round((atual / max) * 100) : 0, partes: stats.compostura.partes.map((p) => ({ ...p, fmt: p.label === "Base" ? String(p.valor) : fmt(p.valor) })) },
      pr: { atual: pr, max: prMax },
      poseAtiva: data.pose,
      resolucao: stats.resolucaoAtual,
      resolucaoBase: stats.resolucao,
      resolucaoPose: stats.resolucaoPose,
      resolucaoLinhagem: stats.resolucaoLinhagem,
      mentalOpcoes: [
        { value: "auto", label: "Maior entre INT e SAB", selected: data.atributoMental === "auto" },
        { value: "int", label: "Inteligência", selected: data.atributoMental === "int" },
        { value: "wis", label: "Sabedoria", selected: data.atributoMental === "wis" }
      ],
      tierOpcoes: Object.entries(TIERS).map(([value, t]) => ({ value, label: `${t.label} — ${t.exemplos}`, selected: value === data.tier })),
      defesas,
      ui: this.#ui,
      marca: data.marca,
      // Ações
      acoes: stats.acoes ?? [],
      apoio: ACOES_APOIO.map((a) => ({
        ...a,
        isCheck: a.kind === "check", isRecompor: a.kind === "recompor", isInfo: a.kind === "info",
        bonusFmt: a.kind === "check" ? fmt(stats.lerMesaBonus ?? 0) : "",
        usado: a.once ? usado(a.id) : false,
        recomporFormula: a.kind === "recompor" ? `1d4 + ${stats.prof}` : ""
      })),
      reacoes: REACOES,
      // Gambitos
      gambitos: GAMBITOS.map((g) => ({
        ...g, escolhido: !!data.gambitos[g.id], usado: g.reset ? usado(g.id) : false,
        podeUsar: !!data.gambitos[g.id] && pr >= g.custo && !(g.reset && usado(g.id))
      })),
      gambitosEscolhidos,
      gambitosContagem: { escolhidos: gambitosEscolhidos.length, permitidos },
      // Origem
      origem: {
        bercos: opcoes(BERCOS, origem.berco, "— escolher —"),
        raizes: opcoes(RAIZES, origem.raizes, "— escolher —"),
        trajetorias: opcoes(TRAJETORIAS, origem.trajetoria, "— escolher —"),
        circuloFamiliar: origem.circuloFamiliar,
        oculta: !!origem.oculta,
        circuloDeclarado: origem.circuloDeclarado,
        ranksDeclarados: RANK_STEPS.map((r) => ({ value: r, label: RANK_LABELS[String(r)], selected: Number(origem.rankDeclarado) === r })),
        rankReal: o ? RANK_LABELS[String(o.rankReal)] : "",
        rankEfetivo: o ? RANK_LABELS[String(o.rank)] : "",
        circulo: o?.circulo ?? "",
        avisos: o?.avisos ?? [],
        dons: (o?.dons ?? []).map((d) => ({ ...d, usado: d.once ? usado(d.id) : false })),
        cicatrizes: o?.cicatrizes ?? []
      },
      temOrigem: !!o
    };
  }

  _onRender() {
    if (!this.actor.isOwner) {
      this.element.querySelectorAll("input, select, button[data-action]").forEach((el) => {
        if (el.dataset.action === "tab") return;
        el.disabled = true;
      });
    }
  }

  // ------------------------------------------------------------ eventos

  static async #onSubmit(event, form, formData) {
    const expanded = foundry.utils.expandObject(formData.object);
    if (expanded.ui) this.#ui = { ...this.#ui, ...this.#normalizeUi(expanded.ui) };
    const flags = expanded.flags?.[MODULE_ID];
    if (!flags) return this.render();

    // Limite de Gambitos por nível
    if (flags.gambitos) {
      const stats = statsFor(this.actor);
      const n = Object.values(flags.gambitos).filter(Boolean).length;
      if (!stats.npc && n > stats.gambitosPermitidos) {
        ui.notifications.warn(`No nível ${stats.nivel} você pode ter ${stats.gambitosPermitidos} Gambito(s).`);
        delete flags.gambitos;
      }
    }
    // Exílio não pode vir de Berço Miserável
    if (flags.origem?.trajetoria === "exilio" && (flags.origem?.berco ?? dadosDe(this.actor).origem.berco) === "miseravel") {
      ui.notifications.warn("Exílio ou Fuga não pode ser escolhido por Berço Miserável.");
    }
    await this.actor.update({ [`flags.${MODULE_ID}`]: flags });
  }

  #normalizeUi(u) {
    const out = { ...u };
    out.extra = Number(u.extra) || 0;
    return out;
  }

  #readUi() {
    const el = this.element;
    const chk = (n) => !!el?.querySelector(`[name="ui.${n}"]`)?.checked;
    const num = Number(el?.querySelector('[name="ui.extra"]')?.value) || 0;
    this.#ui = {
      vantagem: chk("vantagem"), desvantagem: chk("desvantagem"), circulo: chk("circulo"), valor: chk("valor"),
      dom: chk("dom"), cicatriz: chk("cicatriz"), extra: num, medo: chk("medo"), dobrar: chk("dobrar"), maximo: chk("maximo")
    };
    return this.#ui;
  }

  static #onTab(event, target) {
    this.#tab = target.dataset.tab;
    this.render();
  }

  async #setFlags(partial) {
    await this.actor.update({ [FLAG]: partial });
  }

  static async #onRollAcao(event, target) {
    const { id, skill } = target.dataset;
    const stats = statsFor(this.actor);
    const acao = stats.acoes.find((a) => a.id === id);
    const per = acao?.pericias.find((p) => p.key === skill);
    if (!acao || !per) return;
    const ui = this.#readUi();

    // Rolagem de acerto
    const partes = [per.bonus];
    const etiquetas = [`${per.label} ${per.bonusFmt}`];
    if (ui.circulo) { partes.push(2); etiquetas.push("Círculo +2"); }
    if (ui.valor) { partes.push(2); etiquetas.push("Valor +2"); }
    if (ui.dom) { partes.push(2); etiquetas.push("Dom +2"); }
    if (ui.cicatriz) { partes.push(-2); etiquetas.push("Cicatriz −2"); }
    if (ui.extra) { partes.push(ui.extra); etiquetas.push(`Extra ${fmt(ui.extra)}`); }
    const vant = ui.vantagem && !ui.desvantagem ? "2d20kh" : ui.desvantagem && !ui.vantagem ? "2d20kl" : "1d20";
    const atk = new Roll(`${vant} + ${partes.join(" + ").replace(/\+ -/g, "- ")}`);
    await atk.evaluate();

    // Abalo
    let formula = per.formulaAbalo;
    if (ui.medo) formula += " + 1d6";
    const abalo = new Roll(formula);
    await abalo.evaluate({ maximize: ui.maximo });
    let totalAbalo = abalo.total;
    if (ui.dobrar) totalAbalo *= 2;

    // Alvo
    const alvoToken = game.user.targets?.first?.();
    const alvo = alvoToken?.actor;
    let alvoHtml = "";
    let veredito = "";
    if (alvo) {
      const as = statsFor(alvo);
      const cd = as.resolucaoAtual;
      const acertou = atk.total >= cd;
      const estado = as.defesas[acao.tipo];
      const final = aplicarDefesa(totalAbalo, estado);
      veredito = acertou ? "ACERTOU" : "ERROU";
      alvoHtml = `<div class="es-alvo"><strong>${foundry.utils.escapeHTML(alvo.name)}</strong> — Resolução ${cd}
        <span class="es-badge ${acertou ? "hit" : "miss"}">${veredito}</span>
        ${acertou ? `<div>Abalo final: <strong>${final}</strong> <small>(${DEFESA_ESTADOS[estado]})</small></div>` : ""}</div>`;
    } else {
      alvoHtml = `<div class="es-alvo"><em>Sem alvo selecionado: compare o resultado com a Resolução do oponente.</em></div>`;
    }

    const extras = [];
    if (ui.medo) extras.push("Medo atingido +1d6");
    if (ui.dobrar) extras.push("Frase de Efeito ×2");
    if (ui.maximo) extras.push("Verdade Incômoda (máximo)");
    const html = `<div class="embate-card">
      <header><i class="fa-solid fa-masks-theater"></i> ${acao.nome} <small>${TIPOS_ABALO[acao.tipo]}</small></header>
      <div class="es-line"><span>Teste</span> ${await atk.render()}</div>
      <div class="es-line"><span>Abalo</span> ${await abalo.render()}</div>
      <p class="es-sub">${etiquetas.join(" · ")}${extras.length ? `<br>${extras.join(" · ")}` : ""}</p>
      <p class="es-total">Teste <strong>${atk.total}</strong> · Abalo <strong>${totalAbalo}</strong></p>
      ${alvoHtml}
    </div>`;
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      rolls: [atk, abalo], content: html, sound: CONFIG.sounds?.dice
    });
  }

  static async #onRollCheck(event, target) {
    const stats = statsFor(this.actor);
    const ui = this.#readUi();
    const vant = ui.vantagem && !ui.desvantagem ? "2d20kh" : ui.desvantagem && !ui.vantagem ? "2d20kl" : "1d20";
    const extra = ui.extra ? ` + ${ui.extra}` : "";
    const roll = new Roll(`${vant} + ${stats.lerMesaBonus}${extra}`.replace(/\+ -/g, "- "));
    await roll.evaluate();
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      rolls: [roll],
      content: `<div class="embate-card"><header>Ler a Mesa <small>Intuição</small></header>${await roll.render()}<p class="es-sub">Compare com a CD escolhida pelo Mestre. Se passar, descobre o Valor ou o Medo do alvo.</p></div>`
    });
  }

  static async #onRecompor() {
    const data = dadosDe(this.actor);
    if (data.usados.recompor) return ui.notifications.warn("Recompor-se já foi usado neste Embate.");
    const stats = statsFor(this.actor);
    const roll = new Roll(`1d4 + ${stats.prof}`);
    await roll.evaluate();
    const novo = Math.min(stats.compostura.max, composturaAtual(data, stats.compostura.max) + roll.total);
    await this.#setFlags({ compostura: novo, usados: { recompor: true } });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }), rolls: [roll],
      content: `<div class="embate-card"><header>Recompor-se</header>${await roll.render()}<p class="es-total">+${roll.total} Compostura (agora ${novo}/${stats.compostura.max})</p></div>`
    });
  }

  #valorAjuste() {
    const v = Number(this.element.querySelector('[name="amount"]')?.value);
    return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
  }

  static async #onSofrer() {
    const v = this.#valorAjuste();
    if (!v) return;
    const data = dadosDe(this.actor);
    const max = statsFor(this.actor).compostura.max;
    const atual = composturaAtual(data, max);
    const novo = Math.max(0, atual - v);
    await this.#setFlags({ compostura: novo });
    if (novo === 0) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: `<div class="embate-card"><header>Compostura em 0</header><p>${foundry.utils.escapeHTML(this.actor.name)} cede ao Objetivo do oponente.</p></div>`
      });
    }
  }

  static async #onCurar() {
    const v = this.#valorAjuste();
    if (!v) return;
    const data = dadosDe(this.actor);
    const max = statsFor(this.actor).compostura.max;
    await this.#setFlags({ compostura: Math.min(max, composturaAtual(data, max) + v) });
  }

  static async #onUsarGambito(event, target) {
    const g = GAMBITOS.find((x) => x.id === target.dataset.id);
    if (!g) return;
    const data = dadosDe(this.actor);
    const stats = statsFor(this.actor);
    const pr = prAtual(data, stats.prMax);
    if (pr < g.custo) return ui.notifications.warn("Pontos de Retórica insuficientes.");
    if (g.reset && data.usados[g.id]) return ui.notifications.warn(`${g.nome} já foi usado desde o último Descanso longo.`);
    const partial = { pr: pr - g.custo };
    if (g.reset) partial.usados = { [g.id]: true };
    await this.#setFlags(partial);
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: `<div class="embate-card"><header><i class="fa-solid fa-bolt"></i> Gambito: ${g.nome} <small>${g.custo} PR</small></header><p>${g.texto}</p></div>`
    });
  }

  static async #onNovoEmbate() {
    const data = dadosDe(this.actor);
    const usados = { ...data.usados };
    for (const k of Object.keys(usados)) {
      if (k !== "ultimo") usados[k] = false; // "Último Argumento" só volta no Descanso longo
    }
    const max = statsFor(this.actor).compostura.max;
    await this.actor.update({
      [`flags.${MODULE_ID}.usados`]: usados,
      [`flags.${MODULE_ID}.pose`]: false,
      [`flags.${MODULE_ID}.compostura`]: max
    });
    ui.notifications.info(`${this.actor.name}: novo Embate preparado (Compostura cheia, usos por Embate renovados).`);
  }
}

// ---------------------------------------------------------------- descansos

export async function aplicarDescanso(actor, tipo) {
  if (!actor?.isOwner) return;
  const data = dadosDe(actor);
  const stats = statsFor(actor);
  const max = stats.compostura.max;
  const atual = composturaAtual(data, max);
  const updates = {};
  if (tipo === "long") {
    updates.compostura = max;
    updates.pr = stats.prMax;
    updates.usados = { ...data.usados, ultimo: false };
  } else if (tipo === "short") {
    updates.compostura = Math.min(max, atual + Math.floor(max / 2));
    updates.pr = stats.prMax;
  } else return;
  await actor.update({ [`flags.${MODULE_ID}`]: updates });
}
