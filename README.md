# Luwipi

O Luwipi tem quatro áreas: Partituras, Jogos, Tarefas e Imprimíveis.

Os jogos disponíveis são Pinta o Piano e Bolhas do Som. Partituras abrem com piano e reprodução por compasso. Os professores partilham tarefas por link. Imprimíveis são publicados pelo administrador em PDF ou ZIP (até 30 MB por ficheiro).

## Build

`npm ci --ignore-scripts` e `sh scripts/build-static.sh`. A Vercel publica `public/`.

A autenticação, subscrições e biblioteca de partituras usam a configuração Supabase existente. A migração `migrations/printables.sql` adiciona o catálogo de imprimíveis com RLS e armazenamento privado.

`data/requested-repertoire.json` regista os 200 títulos pedidos. Só se publicam partituras quando existir o ficheiro correspondente; nomes não são apresentados como músicas tocáveis.
