import assert from "node:assert/strict";
import { readData, computeStats, computeNpcStats, computeOrigin, abaloDados, gambitosPermitidos, estadoDefesa, aplicarDefesa, composturaAtual } from "../scripts/calc.mjs";

const snap = (cha, int, wis, prof, level) => ({
  level, prof,
  abilities: { cha: { mod: cha }, int: { mod: int }, wis: { mod: wis } },
  skills: { per: { total: cha + prof }, dec: { total: cha }, itm: { total: cha }, prf: { total: cha }, inv: { total: int }, ins: { total: wis + prof } }
});

// Nível 1, CAR +2, SAB +1, prof +2, Humilde/Estável: 8+2+1+0+4+2(raiz firme)=17
let d = readData({ origem: { berco: "humilde", raizes: "vila", trajetoria: "estavel" } });
let s = computeStats(snap(2, 0, 1, 2, 1), d);
assert.equal(s.compostura.max, 17);
assert.equal(s.resolucao, 10 + 2 + 2); // maior mod = CAR +2
assert.equal(s.resolucaoPose, s.resolucao + 4);
assert.equal(s.abaloDados, 1);
assert.equal(s.prMax, 2);

// Sem Origem: 8+2+1+0+4 = 15 (como no exemplo do documento)
s = computeStats(snap(2, 0, 1, 2, 1), readData({}));
assert.equal(s.compostura.max, 15);

// Nível 20: 8+5+4+12 = 29
s = computeStats(snap(5, 0, 4, 6, 20), readData({}));
assert.equal(s.compostura.max, 29);
assert.equal(s.abaloDados, 4);
assert.equal(s.gambitosPermitidos, 6);

// Rank: Miserável + Ascensão sobe um degrau (−1 -> 0); Elite + Queda desce (6 -> 4)
let o = computeOrigin({ berco: "miseravel", trajetoria: "ascensao", oculta: false });
assert.equal(o.rank, 0);
o = computeOrigin({ berco: "elite", trajetoria: "queda" });
assert.equal(o.rank, 4);
// Limites: Elite + Ascensão continua 6; Miserável + Queda continua -1
assert.equal(computeOrigin({ berco: "elite", trajetoria: "ascensao" }).rank, 6);
assert.equal(computeOrigin({ berco: "miseravel", trajetoria: "queda" }).rank, -1);

// Origem Oculta: usa Rank declarado e suspende Dons (Raiz firme)
o = computeOrigin({ berco: "humilde", trajetoria: "estavel", oculta: true, rankDeclarado: 4 });
assert.equal(o.rank, 4);
assert.equal(o.bonusCompostura, 0);
assert.equal(o.donsAtivos, false);

// Avisos
assert.ok(computeOrigin({ berco: "miseravel", trajetoria: "exilio" }).avisos.length > 0);

// Pose com Ermo: +4 +2
d = readData({ origem: { raizes: "ermo" } });
s = computeStats(snap(0, 0, 0, 2, 1), d);
assert.equal(s.resolucaoPose - s.resolucao, 6);

// Linhagem
d = readData({ origem: { berco: "elite" } });
s = computeStats(snap(0, 0, 0, 2, 1), d);
assert.equal(s.resolucaoLinhagem, s.resolucao + 2);

// Defesas
o = computeOrigin({ berco: "miseravel", raizes: "ermo" });
assert.equal(estadoDefesa("medo", o, {}), "res");
o = computeOrigin({ berco: "humilde" });
assert.equal(estadoDefesa("honra", o, {}), "vuln");
assert.equal(estadoDefesa("honra", o, { honra: "imune" }), "imune");
assert.equal(aplicarDefesa(9, "res"), 4);
assert.equal(aplicarDefesa(9, "vuln"), 18);
assert.equal(aplicarDefesa(9, "imune"), 0);

// Tabelas por nível
assert.deepEqual([1, 4, 5, 10, 11, 16, 17, 20].map(abaloDados), [1, 1, 2, 2, 3, 3, 4, 4]);
assert.deepEqual([1, 2, 3, 5, 9, 13, 17].map(gambitosPermitidos), [1, 1, 2, 3, 4, 5, 6]);

// NPC
const n = computeNpcStats(readData({ tier: "elite" }));
assert.equal(n.compostura.max, 30);
assert.equal(n.resolucao, 17);
assert.equal(computeNpcStats(readData({ tier: "invalido" })).compostura.max, 6);

// Compostura atual
assert.equal(composturaAtual({ compostura: null }, 15), 15);
assert.equal(composturaAtual({ compostura: 99 }, 15), 15);
assert.equal(composturaAtual({ compostura: -3 }, 15), 0);

console.log("calc: todos os testes passaram");
