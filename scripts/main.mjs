import { MODULE_ID } from "./data.mjs";
import { EmbateSheet, aplicarDescanso } from "./sheet.mjs";
import { suportaEmbate, statsFor } from "./actor.mjs";

const ICONE = "fa-solid fa-masks-theater";

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Embate Social iniciado`);
});

Hooks.once("ready", () => {
  const mod = game.modules.get(MODULE_ID);
  // API para macros: game.modules.get("embate-social").api.open(actor)
  mod.api = { open: (actor) => EmbateSheet.open(actor), stats: (actor) => statsFor(actor) };
});

// Botão no menu (⋮) do cabeçalho de qualquer ficha de ator compatível
Hooks.on("getHeaderControlsApplicationV2", (app, controls) => {
  const actor = app.document;
  if (!actor || actor.documentName !== "Actor" || !suportaEmbate(actor)) return;
  if (app instanceof EmbateSheet) return;
  if (controls.some((c) => c.action === "embateSocial")) return;
  controls.push({
    action: "embateSocial",
    icon: ICONE,
    label: "Embate Social",
    onClick: () => EmbateSheet.open(actor)
  });
});

// Botão visível ao lado do título da ficha
Hooks.on("renderApplicationV2", (app, element) => {
  const actor = app.document;
  if (!actor || actor.documentName !== "Actor" || !suportaEmbate(actor)) return;
  if (app instanceof EmbateSheet) return;
  const header = element.querySelector(".window-header");
  if (!header || header.querySelector(".embate-social-button")) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "header-control embate-social-button icon " + ICONE;
  btn.dataset.tooltip = "Embate Social";
  btn.setAttribute("aria-label", "Embate Social");
  btn.addEventListener("click", (ev) => { ev.preventDefault(); EmbateSheet.open(actor); });
  const alvo = header.querySelector('[data-action="toggleControls"]') ?? header.querySelector('[data-action="close"]');
  alvo ? alvo.before(btn) : header.append(btn);
});

// Mantém a ficha aberta atualizada quando o ator muda
Hooks.on("updateActor", (actor) => {
  EmbateSheet.instances.get(actor.uuid)?.render();
});
Hooks.on("updateItem", (item) => {
  const actor = item.parent;
  if (actor) EmbateSheet.instances.get(actor.uuid)?.render();
});

// Descansos do dnd5e
Hooks.on("dnd5e.restCompleted", (actor, result) => {
  if (!suportaEmbate(actor)) return;
  const tipo = result?.type ?? (result?.longRest ? "long" : "short");
  aplicarDescanso(actor, tipo);
});
