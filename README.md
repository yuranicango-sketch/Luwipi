# Luwipi

Aplicação web para professores prepararem e conduzirem aulas de piano para crianças.

- `index.html` — landing pública.
- `app.html` — aplicação do professor.
- `api/billing` — Paddle server-side.
- `api/admin/users.js` — administração protegida por função admin.
- `assets/samples` — samples de piano e sons.

As chaves privadas nunca devem entrar em HTML. O código entregue ao navegador é necessariamente visível ao navegador; a segurança fica nas permissões, RLS e funções server-side.
