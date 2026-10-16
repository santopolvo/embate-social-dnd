// Ponte entre o ator do Foundry/dnd5e e os cálculos puros.
import { MODULE_ID, PERICIAS, ATRIBUTOS } from "./data.mjs";
import { readData, computeStats, computeNpcStats } from "./calc.mjs";

export function snapshotOf(actor) {
  const sys = actor.system ?? {};
  const abilities = {};
  for (const k of Object.keys(ATRIBUTOS)) abilities[k] = { mod: sys.abilities?.[k]?.mod ?? 0 };
  const skills = {};
  for (const [k, def] of Object.entries(PERICIAS)) {
    skills[k] = { total: sys.skills?.[k]?.total ?? abilities[def.ability].mod };
  }
  return {
    level: sys.details?.level ?? 1,
    prof: sys.attributes?.prof ?? 2,
    abilities,
    skills
  };
}

export const dadosDe = (actor) => readData(actor?.flags?.[MODULE_ID]);

export function statsFor(actor) {
  const data = dadosDe(actor);
  return actor.type === "npc" ? computeNpcStats(data) : computeStats(snapshotOf(actor), data);
}

export const suportaEmbate = (actor) => ["character", "npc"].includes(actor?.type);
