// Dados das regras do Embate Social (baseado no documento "Embate Social DND '24", por santopolvo).
// Tudo que é texto de regra fica aqui, para ser fácil de ajustar sem mexer na lógica.

export const MODULE_ID = "embate-social";

export const RANK_STEPS = [-1, 0, 2, 4, 6];
export const RANK_LABELS = {
  "-1": "Marginal (−1)",
  "0": "Comum (0)",
  "2": "Respeitado (+2)",
  "4": "Influente (+4)",
  "6": "Eminente (+6)"
};

export const TIPOS_ABALO = {
  logico: "Lógico",
  ilusao: "Ilusão",
  medo: "Medo",
  emocional: "Emocional",
  verdade: "Verdade",
  honra: "Honra"
};

export const DEFESA_ESTADOS = {
  "": "Automático",
  normal: "Normal",
  vuln: "Vulnerável (×2)",
  res: "Resistente (½)",
  imune: "Imune (0)"
};

// Perícia do D&D 5e -> atributo e nome
export const PERICIAS = {
  per: { label: "Persuasão", ability: "cha" },
  dec: { label: "Enganação", ability: "cha" },
  itm: { label: "Intimidação", ability: "cha" },
  prf: { label: "Atuação", ability: "cha" },
  inv: { label: "Investigação", ability: "int" },
  ins: { label: "Intuição", ability: "wis" }
};

export const ATRIBUTOS = { str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR" };

// ---------------------------------------------------------------- Origem

export const BERCOS = {
  miseravel: {
    label: "Miserável", exemplos: "rua, servidão, escravidão", rank: -1,
    dom: { id: "calejado", nome: "Calejado", once: true,
      texto: "Resistência a Medo. Uma vez por Embate, reduz um Abalo em 1d6." },
    cicatriz: "Elites o descartam: −2 em Ações contra Elite e Eminentes.",
    resiste: ["medo"], vulnera: []
  },
  humilde: {
    label: "Humilde", exemplos: "camponês, operário, pescador", rank: 0,
    dom: { id: "gente", nome: "Gente como a gente",
      texto: "+2 em Argumentar ou Comover contra Miserável, Humilde e Remediado." },
    cicatriz: "Vulnerável a Honra (\"quem você pensa que é?\").",
    resiste: [], vulnera: ["honra"]
  },
  remediado: {
    label: "Remediado", exemplos: "artesão, pequeno comerciante, soldado de carreira", rank: 2,
    dom: { id: "ajudaOutro", nome: "Um Ajuda o Outro", once: true,
      texto: "Uma vez por Embate, você pode usar a ação de apoio Ajudar junto com outra Ação." },
    cicatriz: "Vulnerável a Verdade (tem algo a perder se for exposto).",
    resiste: [], vulnera: ["verdade"]
  },
  abastado: {
    label: "Abastado", exemplos: "burguesia, família de guilda ou clero alto", rank: 4,
    dom: { id: "educacao", nome: "Boa Educação", texto: "+2 em Argumentar em ambientes formais." },
    cicatriz: "Vulnerável a Emocional (nunca foi desafiado de verdade).",
    resiste: [], vulnera: ["emocional"]
  },
  elite: {
    label: "Elite", exemplos: "nobreza, linhagem de poder", rank: 6,
    dom: { id: "linhagem", nome: "Linhagem", texto: "+2 de Resolução contra quem tem Rank menor." },
    cicatriz: "Plebe e Submundo são hostis; vulnerável a Honra.",
    resiste: [], vulnera: ["honra"]
  }
};

export const RAIZES = {
  metropole: {
    label: "Metrópole", exemplos: "", circulo: "Povo urbano, mercadores, nobres", resiste: ["ilusao"],
    dom: { id: "leGente", nome: "Lê gente rápido", once: true, texto: "Ler a Mesa vira ação livre, uma vez por Embate." }
  },
  vila: {
    label: "Vila ou campo", exemplos: "", circulo: "Comunidade rural", resiste: ["logico"],
    dom: { id: "palavra", nome: "Palavra tem peso", texto: "Vantagem em Comover quando é sincero." }
  },
  ermo: {
    label: "Ermo", exemplos: "floresta, montanha, deserto", circulo: "Povos de fora das cidades", resiste: ["medo"],
    dom: { id: "calma", nome: "Calma imperturbável", texto: "+2 em Manter a Pose." }
  },
  mar: {
    label: "Mar, rio ou estrada", exemplos: "", circulo: "Viajantes, marinheiros, caravanas", resiste: ["ilusao"],
    dom: { id: "costumes", nome: "Conhece muitos costumes", texto: "Ignora Cicatrizes de Círculos neutros." }
  },
  instituicao: {
    label: "Instituição fechada", exemplos: "templo, academia, caserna, orfanato", circulo: "O Círculo da instituição", resiste: ["logico"],
    dom: { id: "jargao", nome: "Jargão e hierarquia", texto: "Vantagem em Argumentar com membros do seu Círculo." }
  },
  submundo: {
    label: "Submundo", exemplos: "", circulo: "Criminosos e marginais", resiste: ["verdade"],
    dom: { id: "medos", nome: "Conhece os medos", texto: "Ler a Mesa automático contra marginais." }
  },
  lugarNenhum: {
    label: "Lugar nenhum", exemplos: "", circulo: "Ninguém", resiste: ["honra"],
    dom: { id: "semProblemas", nome: "Sem problemas", texto: "Escolhe 2 Círculos neutros como \"familiares\"." }
  }
};

export const TRAJETORIAS = {
  estavel: {
    label: "Estável", exemplos: "ficou onde nasceu", passos: 0,
    dom: { id: "raizFirme", nome: "Raiz firme", texto: "+2 de Compostura." }, bonusCompostura: 2, cicatriz: null
  },
  ascensao: {
    label: "Ascensão", exemplos: "subiu na vida", passos: 1,
    dom: { id: "doisMundos", nome: "Dois mundos", texto: "Escolha um Círculo neutro para ser \"familiar\"." },
    cicatriz: "−2 em Ações contra Elite."
  },
  queda: {
    label: "Queda", exemplos: "perdeu o que tinha", passos: -1,
    dom: { id: "jaVivi", nome: "Já vivi com eles", texto: "Vantagem em Expor contra membros do mesmo Círculo." }, cicatriz: null
  },
  exilio: {
    label: "Exílio ou Fuga", exemplos: "", passos: -1,
    dom: { id: "nadaAPerder", nome: "Nada a perder", once: true, texto: "Uma vez por Embate, você ignora um Abalo de Medo." },
    cicatriz: "Se expuserem sua origem, o Abalo de Verdade é dobrado."
  },
  reinvencao: {
    label: "Reinvenção", exemplos: "identidade falsa", passos: 0,
    dom: null, cicatriz: null,
    nota: "O Rank que a máscara afirma vale enquanto o segredo estiver guardado (veja Origem Oculta)."
  }
};

// ---------------------------------------------------------------- Ações

export const ACOES = [
  { id: "argumentar", nome: "Argumentar", pericias: ["per"], tipo: "logico", texto: "" },
  { id: "blefar", nome: "Blefar", pericias: ["dec"], tipo: "ilusao",
    texto: "Falhar por 5 ou mais revela o blefe: desvantagem em Argumentar contra aquele alvo e você não pode mais fazer a Ação Blefar." },
  { id: "pressionar", nome: "Pressionar", pericias: ["itm"], tipo: "medo", texto: "Exige poder real; +2 se houver testemunhas." },
  { id: "comover", nome: "Comover", pericias: ["prf", "per"], tipo: "emocional", texto: "Funciona melhor contra quem tem um Valor ou Vínculo exposto." },
  { id: "expor", nome: "Expor", pericias: ["inv", "ins"], tipo: "verdade", texto: "Só funciona se você conhece algo verdadeiro sobre o alvo." },
  { id: "provocar", nome: "Provocar", pericias: ["prf", "itm"], tipo: "honra", texto: "Se acertar, o alvo tem desvantagem em Ações contra outras pessoas no próximo turno." }
];

export const ACOES_APOIO = [
  { id: "ajudar", nome: "Ajudar", kind: "info", texto: "Com sua Ação, você dá vantagem para a próxima Ação de um aliado à sua escolha." },
  { id: "lerMesa", nome: "Ler a Mesa", kind: "check", pericia: "ins",
    texto: "Teste de Intuição contra uma CD fixa (escolhida pelo Mestre). Revela o Valor ou o Medo de um alvo." },
  { id: "recompor", nome: "Recompor-se", kind: "recompor", once: true,
    texto: "Com sua Ação, você recupera 1d4 + Bônus de Proficiência da sua Compostura. Uma vez por Embate." },
  { id: "recuar", nome: "Recuar", kind: "info", texto: "Você sai do embate com a Compostura que tem, sem ceder, mas sem o seu Objetivo." }
];

export const REACOES = [
  { id: "contra", nome: "Contra-argumento", texto: "Quando uma Ação contra você falha, responda na hora com uma Ação básica." },
  { id: "apoiarAmigo", nome: "Apoiar um Amigo", texto: "Um aliado próximo gasta a Reação e absorve metade do Abalo. Ele sofre essa metade." }
];

// ---------------------------------------------------------------- Gambitos

export const GAMBITOS = [
  { id: "frase", nome: "Frase de Efeito", custo: 1, texto: "Dobra o Abalo de um ataque bem-sucedido." },
  { id: "pausa", nome: "Pausa Dramática", custo: 1, texto: "Cancela a reação do alvo neste turno." },
  { id: "verdade", nome: "Verdade Incômoda", custo: 1, texto: "Se você já Leu a Mesa, o ataque tem vantagem e Abalo máximo." },
  { id: "mascara", nome: "Máscara", custo: 1, texto: "Repete um teste de Blefar que falhou, sem ser descoberto." },
  { id: "aliado", nome: "Aliado Presente", custo: 1, texto: "Um aliado avança junto com você: +1d6 de Abalo para o grupo até o seu próximo turno (não acumula)." },
  { id: "voz", nome: "Voz de Comando", custo: 2, texto: "Você pode fazer uma Ação básica e uma Ação de Apoio no mesmo turno." },
  { id: "ruptura", nome: "Ponto de Ruptura", custo: 2, texto: "Ignora a Resistência do alvo a um tipo de Abalo." },
  { id: "ultimo", nome: "Último Argumento", custo: 3, texto: "Ao chegar a 0, você fica de pé na conversa com 1 de Compostura. Uma vez por Descanso longo.", reset: "longo" }
];

export const GAMBITO_NIVEIS = [1, 3, 5, 9, 13, 17];

// ---------------------------------------------------------------- NPCs

export const TIERS = {
  comum: { label: "Comum", exemplos: "Pessoas suscetíveis", compostura: 6, resolucao: 10 },
  capaz: { label: "Capaz", exemplos: "Camponês, guarda novato", compostura: 12, resolucao: 13 },
  notavel: { label: "Notável", exemplos: "Capitão, mercador", compostura: 20, resolucao: 15 },
  elite: { label: "Elite", exemplos: "Nobre, sacerdote", compostura: 30, resolucao: 17 },
  poderoso: { label: "Poderoso", exemplos: "Barão, arquimago", compostura: 45, resolucao: 20 },
  lendario: { label: "Lendário", exemplos: "Rei, shogun, criaturas dracônicas", compostura: 60, resolucao: 25 }
};
