---
version: alpha
name: "Luwipi"
description: "Plataforma musical com duas faces — Ensine e Aprenda — para professores, crianças e adolescentes."
colors:
  primary: "#2563EB"
  navy: "#0F172A"
  yellow: "#FBBF24"
  pink: "#F472B6"
  green: "#22C55E"
  purple: "#8B5CF6"
  background: "#F8FAFC"
  surface: "#FFFFFF"
  border: "#E2E8F0"
  muted: "#64748B"
  ink: "#0F172A"
  focus: "#2563EB"
typography:
  display:
    fontFamily: ""Nunito", "Avenir Next Rounded", "Arial Rounded MT Bold", system-ui, sans-serif"
  body:
    fontFamily: ""Nunito", "Avenir Next", system-ui, sans-serif"
  utility:
    fontFamily: "system-ui, sans-serif"
rounded:
  sm: "0.625rem"
  md: "0.875rem"
  lg: "1.25rem"
  xl: "1.75rem"
  pill: "999px"
spacing:
  xs: "0.375rem"
  sm: "0.625rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  section: "4.5rem"
  page-max: "68rem"
components:
  brand-mark: {}
  mode-switch: {}
  button: {}
  card: {}
  field: {}
  video-card: {}
  dialog: {}
---

# Luwipi Design System

## Overview

### Creative North Star

Um caderno de música contemporâneo que cresceu para uma aplicação: papel branco, cores musicais vivas, formas arredondadas e duas notas-personagem que funcionam como assinatura da marca. A identidade deve funcionar para uma criança pequena sem parecer infantil demais para um adolescente.

### Product context and register

- **Audience and primary job:** professores de piano preparam e conduzem aulas; crianças e adolescentes aprendem e praticam.
- **Target market(s) and evidence:** produto digital global em português nesta fase; os preços e mercados podem variar sem alterar a identidade.
- **Locale(s) and language policy:** português como interface principal; texto curto, natural e sem diminutivos excessivos.
- **Usage scene:** computador ou tablet na aula; telemóvel e computador para estudo individual.
- **Register:** híbrido. A landing page é de marca; `/app` e `/admin` são produto.
- **Memorable signature:** o par de notas amarelo + azul com pequenos acentos rosa, associado às duas faces Ensine / Aprenda.
- **Restraint:** ferramentas musicais, formulários, partituras e player de vídeo permanecem claros e funcionais; as cores não competem com a tarefa.
- **Anti-references:** dashboard empresarial cinzento, estética de pré-escola, excesso de gradientes, gamificação com badges/streaks e interface escura como padrão.
- **Token ownership/runtime mapping:** este ficheiro documenta os tokens aceites; os CSS custom properties em `index.html`, `app.html` e `admin.html` são a implementação runtime e devem espelhar estes valores.

## Colors

`primary` é a ação e aprendizagem. `yellow` adiciona descoberta e energia; `pink` marca ritmo/movimento; `green` serve crescimento/sucesso; `purple` diferencia exploração e expressão. `navy` é texto e ações de alta ênfase. Fundos continuam claros para manter a música e a pauta legíveis.

## Typography

A marca usa uma voz arredondada inspirada em Nunito. Quando Nunito não estiver disponível, a pilha cai para famílias arredondadas/sistema. Títulos têm peso 800–900 e espaçamento apertado; corpo usa 600–700 em tamanhos pequenos porque a interface é usada à distância durante aulas.

## Layout

A landing usa uma composição curta: marca → promessa → escolha Ensine/Aprenda → rodapé. A aplicação mantém largura máxima próxima de 1088px, com cartões largos e poucos níveis de navegação. Em ecrãs estreitos, grelhas passam a uma coluna sem esconder ações.

## Elevation & Depth

Hierarquia vem principalmente de cor de superfície, borda e espaçamento. Sombras são suaves e reservadas para cartões principais, player e overlays. Partituras e ferramentas não recebem sombras decorativas.

## Shapes

Cartões usam `rounded.lg` ou `rounded.xl`; controlos usam `rounded.md`; pills e escolhas segmentadas usam `rounded.pill`. Ícones musicais vivem em recipientes arredondados, nunca em círculos aleatórios sem função.

## Components

### Foundational visual states

Hover aumenta contraste ou borda sem alterar geometria. Focus-visible usa anel azul de 3px com offset. Disabled reduz contraste e remove affordance de clique. Estados de loading reservam espaço; erros explicam como recuperar.

### Buttons and actions

Ação principal usa azul ou navy com texto branco. Ensine pode usar navy + amarelo como assinatura; Aprenda usa azul com rosa/roxo em detalhes. Danger permanece separado e textual.

### Navigation and data display

O seletor Ensine/Aprenda é persistente no topo da aplicação. O modo Aprenda nunca mostra preparar aula. O catálogo de vídeos usa cartões simples e um player 16:9 estável.

### Forms and overlays

Campos usam fundo branco, borda `border` e radius `md`. Select nativo é aceitável enquanto o sistema não exigir popup customizado. Textareas não redimensionam manualmente.

### Iconography

Notas musicais, pauta, play e piano são os símbolos principais. O logo usa o par de notas da marca. Ícones nunca substituem labels em ações importantes.

### Motion

Transições de 140–220ms servem mudança de estado. `prefers-reduced-motion` desativa movimento não essencial.

### Content and data visualization

Copy curta, concreta e orientada à ação: “Preparar aula”, “Abrir”, “Continuar”, “Ver aulas”. Evitar linguagem corporativa e promessas pedagógicas absolutas.

## Do's and Don'ts

- **Do:** usar azul, amarelo e rosa como sinais consistentes da marca.
- **Do:** manter Ensine e Aprenda visualmente irmãos, não produtos desconectados.
- **Don't:** infantilizar o modo Aprenda com personagens gigantes ou copy de bebé.
- **Don't:** transformar a dashboard numa coleção de métricas e cartões sem prioridade.
