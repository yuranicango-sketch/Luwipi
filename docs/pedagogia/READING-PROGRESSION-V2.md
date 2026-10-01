# Luwipi · Leitura progressiva v2 — estado da implementação

## Entregue
- Currículo independente A–J × N0–N7 com objetivos e rubricas em `sightreading-foundation-v1.js`.
- Vinte estudos originais dirigidos (um por trilha em N0 e N1) com oito compassos, duas mãos e intenção pedagógica. Para níveis seguintes, o gerador existente fornece material de **treino geral**; não confundir com provas específicas.
- O percurso abre no painel compacto existente, dentro do mesmo workspace, e utiliza o motor de pauta e o piano partilhados, sem recuperar o dashboard antigo.
- Para exercícios de leitura inédita, desativa demonstração sonora até iniciar a primeira tentativa e regista a peça como apresentada após abrir corretamente.
- A Prática devolve métricas captadas **no browser** (grupos de notas e proximidade temporal de ataques); o utilizador continua a informar paragens e avaliação qualitativa. Não há certificação automática a partir de métricas autodeclaradas.
- O diagnóstico continua em seis blocos (oito perguntas de perfil, cinco blocos com duas competências cada, uma leitura corrida de oito compassos). Todas as dez trilhas recebem observação inicial, não colocação definitiva acima de N0.
- Progresso: registo de erros, revisões 1/3/7/14 dias, cartão copiável e cópia privada por utilizador quando autenticado.

## Estrutura de sincronização
- `public.sightreading_progress_v1` no projeto Supabase LUWIPI: `user_id uuid` como PK, `draft jsonb` limitado a 150 KB, `schema_version=1`, `updated_at`.
- RLS ativo, sem privilégio `anon`, e políticas `SELECT/INSERT/UPDATE` apenas para `auth.uid()=user_id`.
- `/api/sightreading-progress` valida a sessão perante Supabase Auth, verifica origem para PUT e preserva revisão otimista via `updated_at`, devolvendo 409 perante conflito.
- O servidor **descarta** `certified`, `verified`, `success` e streak fornecidos pelo browser. Tudo é guardado como rascunho de aprendizagem sem valor de certificação.
- O cliente usa um token obtido por ponte explícita criada na autenticação original do Luwipi e impede misturar filas de gravação após mudança de conta. Em falha de rede continua com uma cópia local.

## Critérios e limites antes de certificar níveis
1. Rever musicalmente os vinte estudos e criar **mais estudos independentes**, não só variações de geração, para os portões dos 80 módulos.
2. Desenvolver provas específicas: mudanças de clave e oitava, intervalos alterados, modulação, voz principal/secundária, baixo Alberti/stride/bossa, pedal e ornamentos, fuga, polirritmia, claves de dó e redução.
3. Exigir 90% em notas e ritmo + pulso estável em três sessões consecutivas verificadas; portão de cinco provas e teste próprio da trilha. Sem dados verificáveis, manter resultados provisórios.
4. Pré-leitura cronometrada e avaliação observada ainda não implementadas. O relatório local não substitui a avaliação humana em microfone, pedal, olhar e nuances de articulação.
5. O banco algorítmico tem variantes finitas. Nunca reaproveitar um exercício visto como primeira vista; permitir repetição do **padrão de erro** em uma nova composição.
6. A sincronização não substitui testes de sessão autenticada real nem auditoria de contas escolares e retenção de dados de menores.

## Qualidade e regressão
O build executa `reliability-check`, `pedagogy-check`, `workspace-pedagogy-check`, `specialized-pedagogy-check`, `progress-sync-check` e `diagnostic-mapping-check`.
Os testes de instrumento validam sintaxe musical, 8 compassos e duas mãos, genuínos contrastes staccato/tenuto e níveis de dinâmica, invariantes de rota e privacidade dos resultados.
