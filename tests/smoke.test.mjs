// Teste de fumaça: carrega a ficha com um "Foundry" falso, monta o contexto e compila o template.
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(process.env.HBS_FROM ?? import.meta.url);
const Handlebars = require("handlebars");

globalThis.foundry = {
  applications: { api: { HandlebarsApplicationMixin: (B) => class extends B {}, ApplicationV2: class { constructor(o) { this.options = o; } } } },
  utils: { expandObject: (o) => o, escapeHTML: (s) => s }
};
globalThis.Hooks = { on() {}, once() {} };

const { EmbateSheet } = await import("../scripts/sheet.mjs");
const tpl = Handlebars.compile(fs.readFileSync(new URL("../templates/sheet.hbs", import.meta.url), "utf8"));

const mkActor = (type, flags) => ({
  name: "Kael", img: "icons/svg/mystery-man.svg", type, isOwner: true, uuid: "Actor.x", id: "x", flags: { "embate-social": flags },
  system: {
    details: { level: 5 }, attributes: { prof: 3 },
    abilities: { cha: { mod: 3 }, int: { mod: 0 }, wis: { mod: 1 }, str: { mod: 0 }, dex: { mod: 0 }, con: { mod: 0 } },
    skills: { per: { total: 6 }, dec: { total: 3 }, itm: { total: 3 }, prf: { total: 3 }, inv: { total: 0 }, ins: { total: 4 } }
  }
});

for (const tab of ["resumo", "acoes", "gambitos", "origem"]) {
  const app = new EmbateSheet(mkActor("character", {
    origem: { berco: "miseravel", raizes: "instituicao", trajetoria: "ascensao" },
    gambitos: { frase: true, ultimo: true }, marca: { valor: "nunca depender de ninguém", medo: "voltar à sarjeta" }
  }));
  app.actor = mkActor("character", { origem: { berco: "miseravel", raizes: "instituicao", trajetoria: "ascensao" }, gambitos: { frase: true } });
  app.render = () => {};
  // acessa a aba pelo método privado via ação estática
  app.constructor.DEFAULT_OPTIONS.actions.tab.call(app, null, { dataset: { tab } });
  const ctx = await app._prepareContext();
  const html = tpl(ctx);
  assert.ok(html.length > 500, `aba ${tab} vazia`);
  assert.ok(!html.includes("undefined"), `aba ${tab} contém "undefined"`);
  assert.ok(!html.includes("[object"), `aba ${tab} contém [object`);
  if (tab === "resumo") {
    // Nível 5: 8 + CAR 3 + SAB 1 + Rank 0 (miserável −1, ascensão +1) + 2×3 = 18
    assert.equal(ctx.compostura.max, 18);
    assert.ok(html.includes("2d6"));
  }
  if (tab === "acoes") assert.ok(html.includes("Argumentar") && html.includes("Persuasão +6"));
  if (tab === "gambitos") assert.equal(ctx.gambitosContagem.permitidos, 3);
  if (tab === "origem") assert.ok(html.includes("Calejado"));
}

// NPC
const npc = new EmbateSheet(mkActor("npc", { tier: "notavel" }));
const nctx = await npc._prepareContext();
const nhtml = tpl(nctx);
assert.equal(nctx.compostura.max, 20);
assert.equal(nctx.resolucao, 15);
assert.ok(nhtml.includes("Tipo de NPC"));

console.log("sheet: contexto e template OK nas 4 abas e no NPC");
