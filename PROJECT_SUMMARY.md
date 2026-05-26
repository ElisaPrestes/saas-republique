# Projeto RepúblicaFácil — Resumo Atualizado

## Visão geral

RepúblicaFácil é uma aplicação web construída com Next.js (App Router) para listar, detalhar e gerenciar candidaturas a repúblicas estudantis. A plataforma permite que usuários se cadastrem, façam login, visualizem repúblicas, enviem candidaturas e que líderes de república administrem essas candidaturas a partir de um painel.

O projeto usa Supabase como backend (autenticação, banco Postgres e storage), TypeScript e Tailwind CSS para a UI.

---

## Principais tecnologias e integrações

- **Next.js 16.2.6** (App Router, Server / Client components)
- **React 19.2.4**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) usado para:
  - Autenticação (email/password + confirmação)
  - Tabelas Postgres: `republicas`, `profiles`, `candidaturas`, `notificacoes`, etc.
  - Storage para fotos (usado pelo formulário de cadastro)

---

## Mudanças recentes e novos módulos (resumo)

- Autenticação completa com fluxos de cadastro (`lib/auth.ts`, `components/auth/*`) e login (`components/auth/LoginForm.tsx`).
- Proteção de rotas e inicialização de cookies com `middleware.ts` usando `createServerClient` de `@supabase/ssr`.
- Sistema de candidaturas:
  - `lib/candidaturas.ts`: helpers para enviar candidatura, listar candidaturas por líder, aceitar/recusar candidaturas e verificar candidaturas server-side.
  - Componente de envio: `components/candidatura/CandidaturaForm.tsx` e rota `app/candidatar/[id]/page.tsx` (rota protegida, exige login).
  - Notificações: inserção em `notificacoes` ao criar/aceitar/recusar candidatura para notificar usuários relevantes.
- Painel do líder: `app/dashboard/page.tsx` junto com componentes em `components/dashboard/*` (`CardRepublicaDash.tsx`, `TabelaCandidaturas.tsx`) para visualizar repúblicas do líder e gerenciar candidaturas.
- Atualizações nas páginas públicas:
  - `app/page.tsx` (listagem) usa `lib/republicas.getRepublicas` com filtros via `searchParams`.
  - `app/republica/[slug]/page.tsx` mostra galeria, detalhes, status, vagas e `BotaoCandidatar` que direciona para o fluxo de candidatura.
- Formulário de cadastro de república (`components/republicas/CadastrarRepublicaForm.tsx`) com geração de `slug`, busca de CEP (ViaCEP) e upload de imagens.

---

## Estrutura de arquivos (atualizada)

Raiz e config
- `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `.env` (variáveis Supabase)

App Router (`app/`)
- `app/layout.tsx` — layout global
- `app/globals.css` — estilos Tailwind
- `app/page.tsx` — listagem pública de repúblicas com filtros
- `app/login/page.tsx` — login (renderiza `LoginForm`)
- `app/cadastro/page.tsx` — rota de cadastro de usuário (opcional)
- `app/cadastrar-republica/page.tsx` — rota autenticada para cadastro de república
- `app/republica/[slug]/page.tsx` — detalhe público por slug
- `app/candidatar/[id]/page.tsx` — rota protegida para enviar candidatura (renderiza `CandidaturaForm`)
- `app/dashboard/page.tsx` — painel autenticado para líderes (lista candidaturas por república)

Components
- `components/Navbar.tsx` — exibe estado de autenticação e ações (login/logout)
- `components/auth/LoginForm.tsx`, `components/auth/CadastroForm.tsx` — fluxos de auth client-side
- `components/republicas/*` — `CardRepublica.tsx`, `HeroBusca.tsx`, `SidebarFiltros.tsx`, `CadastrarRepublicaForm.tsx`, `BotaoCandidatar.tsx`
- `components/candidatura/CandidaturaForm.tsx` — envio de candidatura
- `components/dashboard/*` — `CardRepublicaDash.tsx`, `TabelaCandidaturas.tsx` (gerenciamento)

Libs / lógica
- `lib/republicas.ts` — consultas para listagem e detalhe (com joins em `republica_fotos` e `profiles`)
- `lib/auth.ts` — helpers de signup e criação de profile
- `lib/candidaturas.ts` — envio/gestão de candidaturas, notificações

Supabase utilities
- `utils/supabase/server.ts` — `createServerClient` integrando cookies (server-side)
- `utils/supabase/client.ts` — `createBrowserClient` para uso no browser

Middleware
- `middleware.ts` — inicializa Supabase no middleware e chama `supabase.auth.getUser()` para manter cookies/SSR atualizados. Matcher protege/_inicializa para todas as rotas (exceto assets).

---

## Fluxos detalhados (principais)

1) Autenticação
- Usuários podem se cadastrar (`CadastroForm`) e receber email de confirmação (fluxo do Supabase).
- Login via `LoginForm` e manutenção de sessão com `createBrowserClient`.
- `Navbar` inspeciona `supabase.auth.getUser()` e abre/fecha menus conforme o estado.

2) Listagem e filtro
- `HeroBusca` e `SidebarFiltros` manipulam `searchParams` (client-side). `app/page.tsx` passa os filtros para `getRepublicas`.

3) Detalhe e candidatura
- `app/republica/[slug]/page.tsx` carrega `RepublicaDetalhes` e verifica (server-side) se o usuário já se candidatou.
- `BotaoCandidatar` redireciona usuário não autenticado para `/login?redirect=/candidatar/{id}` ou para `/candidatar/{id}` se autenticado.
- O envio é feito por `enviarCandidatura` em `lib/candidaturas.ts`; lider é notificado via inserção em `notificacoes`.

4) Painel do líder
- `app/dashboard` busca repúblicas do líder (`getRepublicasComCandidaturas`) e exibe candidaturas pendentes/aceitas/recusadas.
- O líder pode aceitar/recusar candidaturas com `aceitarCandidatura`/`recusarCandidatura`, que atualizam status e enviam notificações ao candidato.

---

## Banco de dados / tabelas importantes (expectativa do schema)

- `republicas` (dados da república, `lider_id`, `slug`, `vagas_total`, `vagas_disponiveis`, etc.)
- `republica_fotos` (relacionadas, com `ordem`, `url`, `legenda`)
- `profiles` (perfil do usuário/ líder: `nome`, `telefone`, `avatar_url`)
- `candidaturas` (candidatura: `republica_id`, `user_id`, `mensagem`, `status`, timestamps, `motivo_recusa`)
- `notificacoes` (inseridas ao criar/aceitar/recusar candidaturas)

---

## Observações, limitações e próximos passos recomendados

- Autenticação depende de variáveis de ambiente Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- A UI assume que as tabelas listadas existem com os campos esperados; adaptar queries se o schema divergir.
- Recomenda-se adicionar validação de schema (`zod`) no backend e front-end para inputs de cadastro/candidatura.
- Considerar adicionar paginação e cache (`revalidate`/ISR) para listagens grandes.
- Testes automatizados para `lib/*` e para fluxos de candidatura/aceite/recusa aumentariam confiabilidade.

---

## Como rodar (resumo rápido)

1. Instalar dependências:
```bash
npm install
```
2. Configurar `.env` com chaves Supabase (ver acima).
3. Rodar em desenvolvimento:
```bash
npm run dev
```

---

## Conclusão

O projeto evoluiu de uma listagem simples para uma plataforma com autenticação, fluxo de candidaturas e um painel para líderes. O código está organizado com separação clara de responsabilidades (`app/`, `components/`, `lib/`, `utils/`). Posso agora adicionar uma seção de "Limitações conhecidas" ou gerar um diagrama de alto nível se desejar.
