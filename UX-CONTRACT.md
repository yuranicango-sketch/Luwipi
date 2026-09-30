# Luwipi · contrato da experiência atual

A entrada `/` abre uma ferramenta de atividades musicais. Leitura, Jogos, Ritmo, Prática e Karaokê são acessíveis sem passar por uma trilha. O menu hambúrguer dá acesso aos catálogos, à conta, ao tema e à partilha. Links antigos de `/ensine`, `/aprenda` e `/app` redirecionam para a entrada única; links de tarefa antigos continuam a abrir uma superfície utilizável.

## Atividade

- Partitura e piano são o centro. Controlos não devem ocupar o espaço do instrumento.
- A pauta de uma ou duas claves pode deslizar horizontalmente e ser apresentada inteira. O piano pode ser ocultado numa música.
- O piano manual usa o mesmo motor de amostras do preview e permanece imóvel durante o toque.
- Som, destaque na pauta e tecla iluminada devem concordar. Silêncio não produz nota.
- Em ecrãs pequenos não há deslocação vertical da página; o conteúdo extenso fica no catálogo do menu. As pautas podem deslocar-se horizontalmente.
- Interações infantis não abrem menu de contexto nem seleção acidental; campos editáveis continuam funcionais.

## Conteúdo e tarefas

Uma música publicada é identificada como peça real. O repertório distingue partitura disponível de referência ainda não tocável. Material protegido não se apresenta como domínio público. Professor e aluno usam a mesma ferramenta; o envio como tarefa está no menu e nas superfícies específicas. O destino da tarefa abre diretamente a atividade correspondente.

## Trilhas guardadas

`assets/activities/learning-path.js` e `learning-path.css` conservam a experiência experimental. O módulo está desativado na interface atual. Não se deve voltar a expô-lo até haver currículo, partituras completas e critérios de conclusão pedagógicos.

## Verificação

O build executa `node scripts/reliability-check.mjs`. Revisões visuais cobrem homepage, catálogos, uma e duas claves, jogos, ritmo e prática nos tamanhos de telefone vertical, telefone horizontal, tablet e desktop. Autenticação e faturação exigem validação separada com contas de teste.
