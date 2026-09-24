# Luwipi Design System

## North Star
Luwipi é um instrumento de ensino: estrutura calma para o professor e linguagem visual imediata para a criança. Nada entra na interface apenas para decorar.

## Dois registos
- Professor: silencioso, estruturado, compacto e legível.
- Criança: uma ação por vez, grande, tátil e visual.
- Marketing: expressivo, mas sem parecer um jogo autónomo.

## Faixas etárias
### 2–3 anos
- Accent quente e formas maiores.
- Pouquíssimo texto destinado à criança.
- Movimento, contraste, imitação e causa/efeito.
- A tela recua rapidamente quando chega o piano físico.

### 4–5 anos
- Accent verde.
- Formas + nomes curtos.
- Padrões, sequência, grupos de teclas e primeiras músicas.

### 6–8 anos
- Accent azul.
- Mais estrutura informacional.
- Técnica, leitura gradual, coordenação e repertório.

## Luwi
Luwi é o guia visual consistente da aula. Só aparece para sinalizar uma ação pedagógica, uma transição ou acolhimento. Nunca é decoração solta nem recompensa por pontuação.

## Cor
Nunca comunicar apenas por matiz. Cor deve vir acompanhada de forma, posição, texto curto ou símbolo.
- Ink: #17362D
- Teacher green: #1F5C4C
- 2–3 accent: #B7622F
- 4–5 accent: #2F6B58
- 6–8 accent: #365F87
- Canvas: #F8FAF8
- Paper: #FFFFFF
- Line: #E2E9E5
- Destructive only: red

## Tipografia
Usar a stack rounded/system atual. Headings compactos e fortes; corpo calmo. Texto nunca deve competir com a aula.

## Interação
- Touch targets generosos.
- Focus-visible obrigatório.
- Reduced motion respeitado.
- Nenhum feedback infantil em vermelho/❌.
- “Tenta outra vez” substitui “errado”.
- Coringa resolve foco/técnica; Pausa resolve estado emocional.

## Ilustração
Toda ilustração deve ensinar ou orientar: direção, escuta, pulso, mão, teclado, repertório ou transição. Emoji pode existir como apoio temporário, mas não como linguagem visual final.

## Anti-referências
- Dashboard SaaS cheio de métricas.
- Clone do Duolingo.
- Streaks, XP e badges de culpa.
- Gamificação autónoma longa.
- Ecrã competindo com professor e piano.


## Linguagem visual de aula
- Aulas infantis usam mundos funcionais, não cartões decorativos: personagem, cenário, gesto, som e piano devem apontar para o mesmo conceito.
- Grave/agudo: contraste espacial baixo/alto e personagens com silhuetas claramente diferentes.
- Teclado: teclas pretas sempre visíveis. O grupo de 2 e o grupo de 3 têm identidade visual distinta e também número/texto; nunca apenas cor.
- Notas naturais: cor fixa + letra + nome/forma. Personagens são apoio progressivo, sobretudo em 2–5 anos.
- 2–3: personagem + gesto + causa/efeito.
- 4–5: personagem + letra + padrões do teclado.
- 6–8: letra + posição + pauta; personagens recuam.
- Repertório: antes da pauta pode existir contorno melódico por sílaba; é uma representação do mesmo dado musical, não uma segunda fonte de conteúdo.
- Técnica: rimas de dedos são originais do Luwipi e aparecem como apoio curto dentro do bloco piano.

## Arte original do Luwipi
Arte criada especificamente para o Luwipi (SVG, PNG ou WebP) não é tratada como asset CC0 de terceiros. Ainda assim, passa pela mesma revisão visual do professor antes de se tornar canónica: legibilidade, adequação etária, função pedagógica, contraste, consistência entre notas e ausência de elementos visualmente confusos. A revisão aqui é de qualidade pedagógica/visual, não de licenciamento de terceiros.


## Responsive product composition
- Desktop teacher surfaces use a calm centered canvas with clear reading width; the live lesson may use a split stage + teacher rail.
- Tablet is a first-class classroom viewport, not a scaled desktop. High-density grids reduce columns before text or touch targets become cramped.
- Phone product navigation becomes a persistent bottom dock with safe-area padding. It uses icon/mark + text and a distinct active surface.
- Horizontal teaching sequences become intentional snap rails when a vertical stack would destroy sequence/context.
- Page headings scale down without losing hierarchy; body copy remains readable and action labels stay intact.
- Primary touch controls target approximately 44px or more. Compact metadata chips may be smaller only when they are not actions.
- Sticky filters/actions use stable backgrounds and must not create competing scroll owners.
- The signature remains the child-facing illustrated music world. Teacher chrome stays restrained so it never competes with the lesson.
