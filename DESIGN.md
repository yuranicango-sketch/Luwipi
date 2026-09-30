# Luwipi · sistema visual de atividades

O produto tem uma entrada única. A página inicial apresenta atividades musicais: Leitura, Jogos, Ritmo, Prática e Karaokê. A trilha está arquivada no código até existir um currículo completo. O menu hambúrguer contém navegação, catálogos, conta, tema e envio de tarefas.

## Hierarquia

1. Na atividade, partitura e piano recebem o espaço principal.
2. Uma instrução curta indica a ação presente. Estado e resposta aparecem junto do instrumento.
3. Controlos de reprodução, ajuda e partilha ficam compactos, sem empurrar o instrumento.
4. Listas extensas de exercícios e músicas vivem no catálogo do menu.

## Componentes

- Fundo azul claro (`#e9f0ff`), superfícies suaves (`#f8fbff`) e pauta/teclas brancas. O modo escuro conserva contraste da notação.
- Títulos curtos e uma escala consistente entre 13 e 58 px, adaptada à área visível. Nunca cortar uma instrução essencial para caber.
- Cartões servem apenas para escolhas de atividade ou conteúdo. Não colocar cartões dentro de cartões por decoração.
- Botões com estados legíveis para toque, teclado e foco. O menu e o botão voltar estão disponíveis em cada ferramenta.
- A grelha inicial usa cinco colunas largas, três médias e duas estreitas; em mobile o último cartão ocupa a largura completa.

## Movimento e responsividade

A pauta desliza na horizontal sem cortar clave e notas. O piano não se desloca quando é tocado. Ecrãs curtos reduzem espaços e texto secundário antes de reduzir o instrumento. Animações seguem som e pulso; respeitam `prefers-reduced-motion`.

## Fonte de estilos

`assets/activities/activity-workspace.css` define o shell atual. `viewport-canvas.css` reserva o ecrã para cada atividade; `interface-refinement.css` ajusta pautas de uma e duas claves. CSS da trilha permanece em `learning-path.css`, mas o módulo só inicia com `window.LUWIPI_ENABLE_LEARNING_PATH === true`.
