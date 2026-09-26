---
version: beta
name: "Luwipi"
description: "Uma marca musical premium com duas experiências: Ensine e Aprenda."
colors:
  ink: "#111214"
  paper: "#F5F5F1"
  surface: "#FFFFFF"
  border: "rgba(17,18,20,.11)"
  blue: "#4568FF"
  yellow: "#F3C85B"
  muted: "#747780"
  focus: "#4568FF"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
  utility:
    fontFamily: "Manrope, system-ui, sans-serif"
rounded:
  sm: "0.625rem"
  md: "0.875rem"
  lg: "1.25rem"
  xl: "1.625rem"
  pill: "999px"
spacing:
  xs: "0.375rem"
  sm: "0.625rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  section: "4.5rem"
  page-max: "67.5rem"
components:
  wordmark: {}
  mode-switch: {}
  feature-action: {}
  tool-row: {}
  form-surface: {}
  content-card: {}
  dialog: {}
---

# Luwipi Design System

## Creative North Star

Um estúdio musical contemporâneo transformado em software. O produto não deve parecer “site educativo” nem template de SaaS. A sensação vem de tipografia editorial, espaço negativo, contraste preciso, uma ação principal muito clara e ferramentas organizadas como uma superfície de trabalho.

A identidade é adulta o suficiente para ter credibilidade e leve o suficiente para continuar acessível. Não se comunica idade através de mascotes, badges ou copy demográfica.

## Typography

- **Bricolage Grotesque**: marca, títulos e ações principais.
- **Manrope**: navegação, campos, listas, labels e conteúdo funcional.
- Títulos grandes usam tracking apertado e pesos 600–700; o produto evita black/900 como solução automática.
- O tamanho da tipografia deve criar hierarquia antes de bordas, cores ou sombras.

## Color

A maior parte do produto vive entre paper, surface e ink. Azul é ação e a assinatura de Aprenda. Amarelo aparece com contenção no universo Ensine. Cores não são distribuídas por cartões só para criar variedade.

## Layout

### Landing
Uma única composição dividida em duas experiências. A página não explica o público; Ensine e Aprenda são a navegação e a mensagem.

### Produto
Uma ação principal grande por modo:
- Ensine → Preparar aula
- Aprenda → Aulas

Ferramentas secundárias aparecem como linhas funcionais com ícones de traço, não como mosaico de cartões.

### Forms
O planeador usa poucas superfícies brancas grandes, com grupos internos definidos por espaço e hierarquia tipográfica. Não empilhar “cards dentro de cards”.

## Cards and surfaces

Cards só existem quando agrupam uma unidade real de conteúdo. Usar:
- fundo branco;
- 1px de border de baixo contraste;
- radius 16–20px;
- sombra apenas em elementos focais ou overlays.

Evitar:
- cartões para simples navegação;
- caixas arredondadas em todas as secções;
- ícones em quadrados coloridos sem significado;
- múltiplos tons pastel numa mesma vista.

## Navigation

O cabeçalho é silencioso: wordmark, alternância Ensine/Aprenda, conta. A navegação do dashboard deve parecer uma ferramenta de trabalho, não uma homepage promocional.

## Motion

Transições de 150–180ms em hover/focus. Movimento nunca substitui hierarquia. Respeitar prefers-reduced-motion.

## Copy

A interface deve cortar texto sempre que o layout ou o nome da ação já comuniquem a intenção.

- Bom: “Preparar aula”
- Evitar: “Comece agora a preparar a próxima aula do seu aluno”
- Bom: “Leitura”
- Evitar: “Notas, pautas, exercícios e músicas para leitura”

## Anti-patterns

- estética infantil fora de atividades explicitamente infantis;
- excesso de cards;
- sombras em todas as caixas;
- gradientes decorativos;
- tipografia genérica/system em títulos de marca;
- emojis ou símbolos Unicode como substitutos de iconografia;
- copy explicativa onde uma label resolve;
- badges demográficos na landing;
- dashboards que parecem kits de UI.

## Child activity surfaces

A área de produto continua adulta, editorial e contida. Atividades explicitamente destinadas a crianças pequenas podem abrir um **playfield infantil isolado** sem alterar a identidade do shell.

Para atividades 2–4 anos:
- o jogo pode usar cor mais saturada, personagens, cenário ilustrado e alvos táteis grandes;
- a criança não deve depender de leitura para compreender a ação principal;
- texto de orientação fica no contexto do adulto/professor, não no centro do jogo;
- som, silêncio, movimento e reação visual comunicam a mecânica;
- feedback sonoro deve ser musical ou usar samples reais apropriados. **Nunca usar beep/bip como som de piano, recompensa ou confirmação.**
- ao sair da atividade, a interface volta integralmente ao sistema visual adulto do Luwipi.

A exceção infantil é local ao conteúdo pedagógico; não deve vazar para navegação, conta, planeador, billing ou outras superfícies de produto.

