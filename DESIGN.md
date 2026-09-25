---
version: alpha
name: "Luwipi"
description: "Uma marca musical com duas experiências: Ensine e Aprenda."
colors:
  ink: "#0B1020"
  paper: "#F7F7F4"
  surface: "#FFFFFF"
  border: "#DEDFD9"
  blue: "#2F6BFF"
  yellow: "#F2C94C"
  muted: "#737780"
  focus: "#2F6BFF"
typography:
  display:
    fontFamily: "Avenir Next, Segoe UI, system-ui, sans-serif"
  body:
    fontFamily: "Avenir Next, Segoe UI, system-ui, sans-serif"
  utility:
    fontFamily: "Segoe UI, system-ui, sans-serif"
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1.125rem"
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
  brand-mark: {}
  mode-switch: {}
  primary-action: {}
  tool-navigation: {}
  field: {}
  video-card: {}
  dialog: {}
---

# Luwipi Design System

## Overview

### Creative North Star

Um estúdio de música contemporâneo, não uma aplicação infantil. A interface deve ter a disciplina de um instrumento: poucas peças, hierarquia forte, muito espaço e detalhes precisos. A referência visual vem do piano — preto, branco, ritmo, repetição e um pequeno contraste cromático — sem desenhar um piano literal em cada superfície.

### Product context and register

- **Primary jobs:** Ensine prioriza preparar a aula e abrir ferramentas; Aprenda prioriza abrir aulas e praticar.
- **Locale:** português.
- **Usage scene:** computador/tablet para ensinar; computador/telemóvel para aprender.
- **Register:** híbrido — landing expressiva e mínima; produto funcional e silencioso.
- **Memorable signature:** grandes áreas tipográficas e uma pequena barra de cor, amarela em Ensine e azul em Aprenda.
- **Restraint:** não explicar no ecrã o que o próprio nome Ensine/Aprenda já comunica.
- **Anti-references:** dashboards com dezenas de cartões, mascotes gigantes, gradientes decorativos, pills em excesso, slogans longos, labels demográficos na landing e estética de app pré-escolar.
- **Token ownership/runtime mapping:** este ficheiro documenta as decisões; CSS em `index.html`, `app.html` e `admin.html` implementa os mesmos papéis semânticos.

## Colors

A marca é quase monocromática. `ink`, `paper` e `surface` dominam. `yellow` é o sinal de Ensine; `blue` é o sinal de Aprenda e também o foco acessível. Não usar uma paleta arco-íris para decorar componentes.

## Typography

A personalidade vem do peso, escala e espaçamento, não de uma fonte infantil. Display e corpo usam Avenir Next quando disponível, com Segoe UI/system como fallback. Títulos grandes podem ter tracking apertado; labels e utilidades são pequenos e discretos.

## Layout

Landing: wordmark → título monumental → escolha Ensine/Aprenda. Nada mais é necessário para a primeira decisão. Produto: uma ação principal grande e uma linha compacta de ferramentas secundárias. Grelhas transformam-se em duas/uma coluna no mobile sem esconder ações.

## Elevation & Depth

Evitar sombras como regra. Hierarquia usa bordas, contraste, espaço e mudança de superfície. Overlays são a exceção.

## Shapes

Menos arredondamento que a versão anterior. Cards principais podem ser quadrados/levemente arredondados; controlos mantêm radius médio por ergonomia. Pills só onde o formato comunica seleção compacta.

## Components

### Foundational visual states

Hover altera superfície/contraste sem mexer na geometria. Focus-visible usa anel azul claro. Disabled perde contraste e cursor de ação. Loading mantém a área final estável.

### Buttons and actions

A principal ação de Ensine é “Preparar aula”. A principal ação de Aprenda é “Aulas”. Ações secundárias aparecem como navegação compacta, sem parágrafos explicativos.

### Navigation and data display

Ensine/Aprenda fica no cabeçalho como alternância discreta. Aprenda nunca expõe o planeador. O catálogo de vídeos mostra conteúdo, não metadados demográficos.

### Forms and overlays

Formulários mantêm fundo branco, borda clara e alta legibilidade. Textareas não redimensionam manualmente. Overlays usam foco e recuperação explícitos.

### Iconography

O símbolo Luwipi é um monograma abstrato e contido. Ícones musicais são funcionais; evitar personagens e ilustrações na navegação principal.

### Motion

Transições 140–180ms apenas para hover, seleção e abertura. Respeitar `prefers-reduced-motion`.

### Content and data visualization

Copy mínima. Se uma palavra resolve, não usar uma frase. Evitar explicar o público-alvo na interface pública.

## Do's and Don'ts

- **Do:** deixar a hierarquia e o espaço comunicarem.
- **Do:** manter Ensine e Aprenda como duas faces da mesma marca.
- **Don't:** colocar “crianças”, “adolescentes” ou “professores” como badges de marketing sem necessidade.
- **Don't:** adicionar cartões, descrições ou cores apenas para preencher espaço.
