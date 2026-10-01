> **Histórico (V3):** a referência atual de UX e currículo é [READING-PROGRESSION-V4.md](READING-PROGRESSION-V4.md). Os totais desta revisão foram superados.

# Luwipi · Auditoria do percurso de leitura N0–N7 (versão consolidada)

## Âmbito e estado

O currículo contém **80 módulos** (10 trilhas A–J × 8 níveis N0–N7), cada um com objetivo e evidência pedagógica definida. Todos possuem material musical executável, mas treino **não é certificação**: a passagem de nível exige validação especializada, provas independentes e verificação de desempenho que o atual fluxo ainda não conclui.

| Níveis | Estudos específicos por nível | Material adicional | Modalidade |
|---|---:|---|---|
| N0–N1 | 20 (um por trilha e nível) | Banco de treino gerado | Treino orientado |
| N2 | 10 (um por trilha) | Banco de treino gerado | Treino orientado |
| N3 | 14 (variações originais entre as trilhas) | Banco de treino gerado | Treino orientado |
| N4 | 11 (alguns objetivos com cobertura parcial) | Banco de treino gerado | Treino orientado |
| N5 | 20 (10 composições + 10 variações de leitura recompostas) | Banco de treino gerado | Treino orientado |
| N6 | 21 (inclui 5/8, 7/8 e polirritmia 3:2 em estudos separados) | Banco de treino gerado | Treino orientado |
| N7 | 20 (inclui leituras inéditas de 16 compassos) | Banco de treino gerado | Treino orientado |

**Total dos estudos dirigidos: 116**, além de **1.344 variantes algorítmicas gerais**. Há 60 perguntas de escolha múltipla específicas para os 30 módulos N5–N7, além das perguntas e do diagnóstico dos níveis anteriores. Não apresentar variações recompostas como provas independentes certificadas.

## Competências dirigidas nos níveis finais

| Trilha | N5 | N6 | N7 |
|---|---|---|---|
| A · Pentagrama | Extremos e transposição visual de registo; 8va/15ma **parcial** | Vários registos e vozes em duas pautas; mudanças de clave **parciais** | Extremos e sobreposição; claves de Dó e pautas adicionais **parciais** |
| B · Intervalos | Qualidades cromáticas, 3.ª/5.ª | Aumentados, diminutos e inversões | Intervalos alterados e textura densa |
| C · Tonalidade | Tonicizações com acidentes explícitos | Enarmonia; modulação gráfica **parcial** | Enarmonia complexa; armaduras politonais **parciais** |
| D · Acordes | Voicings fechados/abertos e notas comuns | Dominantes alteradas e resolução | 9.ª/13.ª, cifras e complexidade de acompanhamento |
| E · Mão esquerda | Stride e walking bass | Padrões gospel/bossa escritos e aproximação cromática | Mistura de estilos; realização espontânea/baixo cifrado **parciais** |
| F · Ritmo | Colcheias de swing indicadas; feel humano **parcial** | 5/8, 7/8 e 3:2 em **partituras diferentes** | 7/8 e 3:2; mudanças sucessivas de métrica **parciais** |
| G · Expressão | Plano dinâmico principal/acompanhamento; escuta **parcial** | Ornamentação escrita e pedal sincopado; ressonância **parcial** | Dinâmica por vozes; notação gráfica contemporânea **parcial** |
| H · Polifonia | Três vozes independentes | Quatro entradas de fugato; fuga completa **parcial** | Quatro vozes densas e hierarquia |
| I · Olhar | Pré-leitura cromática | Quatro vozes condensadas; 4 pautas separadas **parciais** | Leitura inédita de 16 compassos, com pré-leitura cronometrada |
| J · Profissional | Redução coral condensada; ensemble externo **parcial** | Transposição global +5; instrumentos simultâneos diferentes **parciais** | Redução longa de 16 compassos; teatro, claves de Dó e grafismo **parciais** |

A descrição **Parcial** aparece ao utilizador quando há funcionalidade por implementar. Nenhum exercício incompleto deverá desbloquear certificação automática.

## Política de primeira vista e avaliação

- O aluno tem 30 segundos de pré-leitura antes de iniciar leitura inédita; a demonstração e reprodução são bloqueadas antes da tentativa.
- Ao abrir uma pauta, todo o material apresentado, incluindo prévias e padrões de dois compassos, deixa de contar como inédito pelo seu ID.
- Primeiro são escolhidos estudos dirigidos inéditos de cada nível; depois, variantes gerais que ainda não tenham sido apresentadas. O fim do banco deve ser comunicado claramente, sem reciclar a mesma peça como primeira vista.
- A Prática mede localmente grupos de notas e tolerância de ataques quando possível. Paragens, intenção expressiva, olhar, pedal real e desempenho profissional requerem validação adicional. A sincronização autenticada guarda resultados como **rascunhos não certificados**, com RLS individual.

## Testes obrigatórios

O build mantém os testes de fiabilidade, pedagogia A–J, percurso, notas e score, identidade/progresso autenticado, estudos N2/N3/N4, revisão espaçada e acidentes ABC. Além disso, `scripts/final-curriculum-check.mjs` deverá validar:
1. As 80 matrizes e objetivos, as 1.344 variantes gerais e os 116 estudos dirigidos.
2. Cada pauta, clave, voz independente, oitavo compasso (ou décimo sexto em N7), ritmo, alturas e armaduras interpretadas pelo motor real.
3. Identidade de cada variante N5–N7, ausência de repetição durante a escolha como leitura inédita e 60 perguntas válidas.
4. Escrita de enarmonia/acidentes explícitos, polirritmia ternária, 5/8 e 7/8, contraste dinâmico, pedal anotado e 16 compassos.
5. Montagem na aplicação, controlo compacto de exploração e conservação do catálogo de músicas preexistentes.

**Critério de entrega:** integração numa única alteração no ramo principal após validar o conjunto completo. Uma publicação de produção apenas, sem builds de pré-visualização. Se a quota Vercel impedir a publicação, reportar o bloqueio sem apresentar a integração GitHub como deploy verificado.

## Limites restantes antes de uma certificação profissional

Claves de Dó e mudança gráfica de clave/armadura no meio da peça, 8va/15ma completos, mistura de compassos na mesma pauta, swing audível e verificado, grafismo contemporâneo, pedalação captada por MIDI CC64 ou professor, leitura de 4 pautas separadas, redução e transposição simultânea de instrumentos de tonalidades diferentes. Provas com material completamente novo e validação humana são necessárias para fechar esses pontos.
