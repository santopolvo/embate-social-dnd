# Embate Social (D&D 5e) — módulo para FoundryVTT

Ficha extra de **Embate Social** para o sistema D&D 5e, baseada no homebrew de *santopolvo*.
Abre por um botão na ficha do personagem e calcula tudo a partir dos dados da ficha.

Requisitos: Foundry **v13** e sistema **dnd5e 5.x**.

## Instalação

1. Copie a pasta `embate-social` para `Data/modules/` do seu Foundry (ou extraia o `.zip` lá).
2. Reinicie o Foundry, abra o mundo e ative **Embate Social (D&D 5e)** em *Gerenciar Módulos*.
3. Abra a ficha de um personagem ou NPC: clique no ícone de máscaras no cabeçalho (ou no menu ⋮ → *Embate Social*).

Por macro: `game.modules.get("embate-social").api.open(actor)`

## O que é calculado automaticamente

| Valor | Fórmula |
| --- | --- |
| Compostura | 8 + mod. CAR + mod. INT/SAB + Rank + 2 × proficiência (+2 com Raiz firme) |
| Resolução | 10 + maior mod. entre INT/SAB/CAR + proficiência |
| Abalo | 1d6 (nív. 1–4), 2d6 (5–10), 3d6 (11–16), 4d6 (17–20) + mod. do atributo da perícia |
| Pontos de Retórica | igual ao bônus de proficiência |
| Gambitos | 1 no nível 1 e +1 nos níveis 3, 5, 9, 13 e 17 |

Os bônus de perícia vêm da ficha do dnd5e (inclui proficiência, especialização e bônus de itens/efeitos).

## Abas da ficha

- **Resumo:** barra de Compostura (sofrer Abalo, recuperar, novo Embate), Resolução, Manter a Pose, Pontos de Retórica e defesas por tipo de Abalo.
- **Ações:** Ações, Ações de Apoio, Reações e Defesas. Cada botão de perícia rola o teste e o Abalo juntos, num cartão no chat. Com um token de alvo selecionado, compara com a Resolução dele e aplica Vulnerabilidade/Resistência/Imunidade ao Abalo.
- **Gambitos:** escolha (limitada pelo nível) e uso, que gasta Pontos de Retórica.
- **Origem:** Berço, Raízes, Trajetória e Marca, com Dons, Cicatrizes, Rank real e em vigor, e Origem Oculta.

NPCs têm uma versão simples: tipo (Comum a Lendário) define Compostura e Resolução; Valor e Medo e defesas por tipo são editáveis.

Descansos do dnd5e: o descanso curto devolve metade da Compostura máxima e todos os Pontos de Retórica; o longo devolve tudo e renova o Último Argumento.

## Decisões que o documento não fechava

- **"INT/SAB" na Compostura:** o padrão é o maior entre os dois; dá para fixar INT ou SAB na aba Resumo.
- **Bônus situacionais** (Círculo Natal +2, Valor +2, Dons de +2, Cicatriz −2, testemunhas etc.) são caixas que você marca antes de rolar. O módulo mostra Dons e Cicatrizes, mas não sabe quem é o alvo para decidir sozinho.
- **Origem Oculta:** com "Segredo guardado" marcado, valem o Rank e o Círculo declarados; os Dons da Origem Real ficam suspensos, e Cicatrizes e Resistências continuam valendo.
- **Reinvenção** não tem Dom próprio: usa o Rank declarado quando o segredo está guardado.
- **Descanso curto:** interpretei "recupera metade" como metade da Compostura máxima.

## Limitações conhecidas

- O Abalo não é aplicado automaticamente no ator alvo (o cartão do chat mostra o valor final; use "Sofrer Abalo" na ficha dele).
- Só Compostura, Pontos de Retórica e usos por Embate são salvos; Marca, Origem e Gambitos ficam nas *flags* do ator (exportam junto com ele).

## Testes

`node tests/calc.test.mjs` valida as fórmulas (inclui os exemplos do documento). `tests/smoke.test.mjs` monta a ficha com um Foundry falso e compila o template (precisa do pacote `handlebars`).

## Publicar com Manifest URL (GitHub)

1. Crie um repositório público no GitHub (ex.: `embate-social`) e envie o conteúdo desta pasta.
2. Crie uma tag e envie: `git tag v0.1.0 && git push origin v0.1.0`.
3. A Action `.github/workflows/release.yml` gera a release com `module.json` e `embate-social.zip` e preenche as URLs sozinha.
4. O Manifest URL fica: `https://github.com/SEU-USUARIO/embate-social/releases/latest/download/module.json`

No Foundry: *Add-on Modules → Install Module → Manifest URL*. Para atualizar, crie uma tag nova (`v0.1.1`...).
