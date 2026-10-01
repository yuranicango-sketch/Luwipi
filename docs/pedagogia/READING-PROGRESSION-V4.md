# Luwipi · Percurso de leitura e Prática — Revisão V4

## O que é entregue
- Um único ponto de entrada **Aprender partitura**: ecrã 1 com 10 habilidades e estado da aprendizagem; ecrã 2 com nível escolhido e uma ação principal **Começar leitura**. Aquecimento, reconhecimento com quatro opções, padrões de dois compassos e revisão permanecem opcionais num seletor secundário.
- **Músicas e atividades** abre sempre a biblioteca atual (inclusive em refresh e no botão Voltar), nunca a antiga introdução do piano azul. As sete músicas preexistentes permanecem na biblioteca. A antiga jornada imersiva está inativa na navegação normal e o módulo legado de aprendizagem não está montado. O código histórico da introdução é preservado apenas para compatibilidade até à remoção final após QA visual autenticada.
- Menu fechado de início, com controlo explícito para abrir/fechar. Piano único no canvas sem moldura azul, com **Mostrar/Esconder piano** na barra superior; escondê-lo liberta toda a altura da sua linha. Sem segunda ação de importação na barra (os modos MIDI/Prática têm a sua).
- Currículo: **10 trilhas × 8 níveis = 80 módulos**, **1.344 variações gerais** mais **119 estudos específicos**: 20 em N0/N1, 10 em N2, 14 em N3, 13 em N4, 20 em N5, 21 em N6 e 21 em N7. **60 perguntas** avançadas de escolha múltipla, mais o diagnóstico anterior.
- Material de primeira vista: um índice musical compilado compara **1.463 partituras**, sinaliza **63 grupos de equivalência** (127 IDs) e marca as versões equivalentes como já vistas. O banco não atribui automaticamente certificação.

## Suporte novo de notação e execução
1. **Claves de Dó** alto/tenor, com trocas por compasso e leitura em 2–4 pautas independentes.
2. **Armaduras variáveis** durante a peça e **duas armaduras simultâneas** em pautas diferentes, quando indicadas pelo exercício; mantém grafias enarmónicas.
3. **Compassos variáveis** 5/8–7/8 na mesma partitura, inclusive ritmo independente por voz, preservando as durações de cada compasso. Polirritmia 3:2 em exercício próprio.
4. **8va/15ma** com linha de indicação e altura de execução real transposta, mantendo a altura escrita na pauta.
5. **Ornamentos**: mordente (ziguezague), apogiatura (nota pequena) e trinado (tr); o estudo N4 G inclui expansão sonora que cabe no valor da nota principal.
6. **Swing 2:1** na camada de reprodução: partitura apresenta colcheias convencionais e legenda de interpretação longa–curta.
7. **Rubato escrito** por mudanças de tempo na partitura e na reprodução; ações de pedal registadas de um teclado MIDI por **CC64**, com contagem no relatório. Não se atribui qualidade sonora automaticamente com base na mera quantidade de mudanças.
8. **Transposição por voz**: o N6 J pratica intervalos distintos nas diferentes pautas sem alterar a pauta original.

## Progressão e integridade
- Um exercício ouvido, mostrado como aquecimento ou reproduzido deixa de ser material inédito.
- Ao selecionar um estudo, a mesma partitura noutra trilha/nível também deixa de ser nova. A lista fica no rascunho local e faz parte do progresso sincronizado do utilizador autenticado.
- Os resultados subjetivos e medições locais são classificados como **provisórios**. A apresentação de 80 módulos e dos seus estudos não garante certificação profissional: o portão formal só aceita provas originais novas verificadas e leitura medida de forma independente.
- Músicas antigas e exercícios anteriores continuam disponíveis. A biblioteca, as atividades e a Prática usam o mesmo roteamento e o mesmo piano.

## Limites que NÃO se resolvem só com JavaScript
Quatro estudos de N7 continuam conscientemente assinalados como parciais: dois de **baixos cifrados e redução espontânea**, que exigem decisão criativa do músico, e dois de **interpretação expressiva contemporânea**, que podem exigir notação gráfica arbitrária, rubato não mensurado e validação humana. O motor cobre a notação e os gestos definidos nos estudos, mas não substitui professor, pianista acompanhador ou prova supervisionada. O rastreio do olhar, o equilíbrio expressivo real, a ressonância acústica e o acompanhamento de regente também não são dedutíveis de note-on MIDI. Estes limites permanecem explícitos para os utilizadores; não os disfarçar de aprovação automática.

## Verificação de entrega
O build verifica as regressões existentes e acrescenta:
- `scripts/n4-specialized-check.mjs`: 13 estudos N4, incluindo clave de Dó, compasso variável e ornamentos com expansão sonora.
- `scripts/abc-accidental-fidelity-check.mjs`: 1.344 variações gerais e 57 estudos N0–N4 com alturas e acidentes corretos.
- `scripts/final-curriculum-check.mjs`: todos os níveis, 62 estudos N5–N7, 60 perguntas, compassos completos, quatro vozes, key maps, 8va/15ma e dinâmica.
- `scripts/score-equivalence-check.mjs`: recompõe o índice das 1.463 partituras e rejeita equivalências obsoletas.
- `scripts/advanced-workspace-ux-check.mjs`: rotas de catálogo, volta e refresh, menu, painel de aprendizagem, recolha total do piano, conservação das músicas e transições reais de MIDI CC64.

Uma única integração no ramo principal e uma única publicação de produção após passar os testes. O teste em navegador com conta autenticada, em vários tamanhos de ecrã, permanece uma etapa de QA externa à automação sem credenciais: não reportar como executado se não o for.
