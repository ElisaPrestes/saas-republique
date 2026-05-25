# Projeto RepúblicaFácil — Resumo Detalhado

## Visão geral

Este projeto é uma aplicação web Next.js moderna para listar e detalhar repúblicas estudantis, permitindo cadastro, visualização de propriedades, filtros por características e interação com autenticação via Supabase.

A implementação utiliza o App Router do Next.js, TypeScript e Tailwind CSS via PostCSS, com integração ao Supabase tanto no servidor quanto no cliente.

---

## Tecnologias principais

- **Next.js 16.2.6**
  - App Router (`app/`)
  - Rotas dinâmicas e Server Components
- **React 19.2.4**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Supabase**
  - `@supabase/ssr` para cliente server-side com cookies
  - `@supabase/supabase-js` para cliente browser
- **ESLint 9** com `eslint-config-next`

---

## Estrutura de arquivos

### Raiz do projeto

- `package.json`
  - scripts: `dev`, `build`, `start`, `lint`
  - dependências: `next`, `react`, `react-dom`, `@supabase/ssr`, `@supabase/supabase-js`
- `next.config.ts`
  - configura `remotePatterns` para `images.unsplash.com`
- `tsconfig.json`
  - paths: `@/*` para `./*`
  - configurações de compilador para Next e React
- `postcss.config.mjs`
  - integra Tailwind CSS com PostCSS
- `middleware.ts`
  - existe no projeto, mas não está detalhado aqui; é a porta para middlewares de rota
- `.env`
  - arquivo local não versionado para variáveis de ambiente (Supabase URL/KEY)

### `app/`

Pasta principal do App Router. Contém páginas, layout e estrutura de rotas.

- `app/layout.tsx`
  - define o layout padrão global da aplicação
- `app/globals.css`
  - estilos globais, provavelmente usa classes de Tailwind e estilos customizados
- `app/page.tsx`
  - página inicial
  - busca repúblicas usando `getRepublicas`
  - renderiza `Navbar`, `HeroBusca`, `SidebarFiltros` e `CardRepublica`
  - aceita filtros via `searchParams`
- `app/login/page.tsx`
  - rota de login
- `app/cadastrar-republica/page.tsx`
  - rota de cadastro de república
  - renderiza `CadastrarRepublicaForm` (componente client)
- `app/republica/[slug]/page.tsx`
  - rota dinâmica de detalhe da república
  - busca república por `slug` com `getRepublicaBySlug`
  - renderiza galeria de imagens, detalhes, comodidades e botão de candidatura

### `components/`

Componentes UI reutilizáveis.

- `components/Navbar.tsx`
  - navegação principal com links para home, cadastro e login
- `components/republicas/`
  - `CardRepublica.tsx`
    - cartão de listagem da república
    - usa `next/link` e `next/image`
    - gera link para `/republica/${republica.slug ?? republica.id}`
  - `BotaoCandidatar.tsx`
    - componente client responsável por redirecionar para o fluxo de candidatura
    - usa `useRouter` e `createClient` do Supabase no browser
  - `HeroBusca.tsx`
    - provavelmente componente de busca hero na home
  - `SidebarFiltros.tsx`
    - filtros laterais usados na listagem de repúblicas
  - `CadastrarRepublicaForm.tsx`
    - formulário client para cadastro de república
    - contém steps, validação, upload de imagens e lógica de submissão ao Supabase

### `lib/`

Lógica de domínio e acesso a dados.

- `lib/republicas.ts`
  - tipos compartilhados: `Endereco`, `RepublicaFoto`, `Lider`, `Republica`, `RepublicaDetalhes`, `FiltrosRepublica`
  - função `getRepublicas(filtros)`
    - consulta repúblicas ativas com vagas disponíveis
    - aplica filtros de gênero, pets, garagem, mobiliada, internet, preço e estado
    - busca por `universidade` ou `endereco->>cidade`
    - retorna lista com apenas 1 foto principal (`limit(1)` no join)
  - função `getRepublicaById(id)`
    - busca detalhada por `id`
    - retorna fotos completas e responsável (`profiles!lider_id`)
  - função `getRepublicaBySlug(slug)`
    - busca detalhada por `slug`
    - mesma seleção que `getRepublicaById`

### `utils/supabase/`

Conexão com Supabase para server e cliente.

- `utils/supabase/server.ts`
  - `createClient()` server-side
  - usa `createServerClient` de `@supabase/ssr`
  - incorpora cookies do Next.js com `next/headers`
- `utils/supabase/client.ts`
  - `createClient()` client-side
  - usa `createBrowserClient` de `@supabase/ssr`

### `public/`

- ativos estáticos como `favicon.ico`
- possivelmente imagens ou assets usados pelo site

---

## Arquitetura geral

### App Router + Server Components

O projeto segue a arquitetura moderna do Next.js App Router:

- `app/page.tsx` e `app/republica/[slug]/page.tsx` são Server Components por padrão.
- a lógica de dados fica em `lib/republicas.ts` e em `utils/supabase/server.ts`.
- a camada de renderização server-side obtém dados e retorna HTML pronto.
- componentes que usam estado e evento no browser usam `use client` (por exemplo `CardRepublica` e `BotaoCandidatar`).

### Separação de responsabilidades

- `app/` lida com rotas, layout e composição de páginas.
- `components/` lida com UI reutilizável e interatividade.
- `lib/` lida com regras de negócio e acesso a dados.
- `utils/` lida com infraestrutura e provedores externos.

### Padrões observados

- `Link` de navegação do Next.js em componentes de listagem e menu.
- `Image` do Next.js para otimização de imagens.
- `getRepublicas` e `getRepublicaBySlug` isolam consultas ao banco.
- tipagem forte com TypeScript em todo o código.
- uso de `next/navigation` para redirecionamento e `notFound()` em detalhe de rota.

---

## Fluxos principais

### Home / listagem

1. `app/page.tsx` recebe `searchParams`
2. chama `getRepublicas` com filtros
3. renderiza `Navbar`, `HeroBusca`, `SidebarFiltros`, lista de `CardRepublica`
4. cada `CardRepublica` cria link para `/republica/${slug || id}`

### Página de detalhe da república

1. `app/republica/[slug]/page.tsx` recebe `slug`
2. busca dados com `getRepublicaBySlug(slug)`
3. carrega dados de imagem, descrição, cards e responsável
4. checa se usuário já se candidatou usando Supabase server-side
5. renderiza `BotaoCandidatar` e informações de contato

### Cadastro de república

1. rota `app/cadastrar-republica/page.tsx`
2. renderiza `CadastrarRepublicaForm`
3. formulário é gerenciado client-side
4. gera `slug` a partir do nome
5. valida campos por etapa
6. grava república em `republicas` e upload de imagens no Supabase
7. atualiza perfil do líder em `profiles`

---

## Observações de arquitetura e oportunidades de melhoria

- A camada de dados está bem isolada em `lib/republicas.ts`, o que facilita testes e reutilização.
- O separador `utils/supabase/server.ts` é uma boa prática para manter a configuração de Supabase centralizada.
- Recomenda-se criar subcomponentes menores para o formulário de cadastro se ele crescer demais.
- Pode ser útil adicionar validação de schema com `zod` ou similar para fortalecer os contratos de dados.
- Se houver cache e performance, considere usar `revalidate`/`cache` do Next.js nos dados de listagem.

---

## Arquivos e pastas mais importantes

- `app/page.tsx`
- `app/republica/[slug]/page.tsx`
- `app/cadastrar-republica/page.tsx`
- `components/Navbar.tsx`
- `components/republicas/CardRepublica.tsx`
- `components/republicas/BotaoCandidatar.tsx`
- `components/republicas/CadastrarRepublicaForm.tsx`
- `lib/republicas.ts`
- `utils/supabase/server.ts`
- `utils/supabase/client.ts`
- `next.config.ts`
- `tsconfig.json`
- `package.json`

---

## Como rodar o projeto

1. Instalar dependências:
   ```bash
   npm install
   ```
2. Configurar variáveis de ambiente em `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Iniciar em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Construir para produção:
   ```bash
   npm run build
   ```

---

## Conclusão

O projeto já segue um padrão adequado para um app Next.js com App Router e Supabase. A arquitetura é funcional, com camadas de UI, dados e infra bem separadas.

O ponto mais crítico atualmente é o uso de rotas amigáveis via `slug`, que já foi implementado e deve ser mantido no fluxo de listagem e detalhe de repúblicas.
