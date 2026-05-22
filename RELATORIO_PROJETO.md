# Relatório de Projeto — Republique

## Visão Geral

Este projeto é uma aplicação web de catálogo de repúblicas estudantis construída com Next.js, React e Supabase. O objetivo principal é permitir que estudantes encontrem repúblicas por estado, gênero, universidade, características e valor, além de acessar páginas de detalhes e fluxo de login/cadastro.

## Arquitetura Geral

### 1. Estrutura de Pastas

- `app/`
  - `layout.tsx` — layout raiz, metadados e fontes compartilhadas.
  - `globals.css` — estilos globais e tema com Tailwind CSS v4.
  - `page.tsx` — página inicial com busca, filtros e listagem de repúblicas.
  - `cadastrar-republica/page.tsx` — página de cadastro de república em desenvolvimento.
  - `login/page.tsx` — página de autenticação para login e cadastro de usuários.
  - `republica/[id]/page.tsx` — página de detalhes de uma república específica.

- `components/`
  - `Navbar.tsx` — barra de navegação global.
  - `republicas/HeroBusca.tsx` — componente de busca e seleção de estados.
  - `republicas/SidebarFiltros.tsx` — componente de filtros laterais.
  - `republicas/CardRepublica.tsx` — cartão de exibição de república na listagem.
  - `republicas/BotaoCandidatar.tsx` — botão que redireciona o usuário para candidatar-se.

- `lib/`
  - `republicas.ts` — lógica de consulta a repúblicas com filtros e tipos TypeScript.

- `utils/supabase/`
  - `client.ts` — cria cliente Supabase para uso no browser.
  - `server.ts` — cria cliente Supabase para uso no server-side com suporte a cookies.

## Fluxo da Aplicação

### Página Inicial (`/`)

- Exibe um feed de repúblicas com filtros por:
  - estado
  - gênero
  - preço máximo
  - tipo de quarto
  - mobiliada
  - aceita pets
  - garagem
  - internet inclusa
- Permite busca por universidade usando query params.
- Utiliza `getRepublicas` em `lib/republicas.ts` para consultar Supabase no servidor.
- Mostra o número total de repúblicas encontradas e uma grade responsiva de cards.

### Página de Detalhes (`/republica/[id]`)

- Busca dados detalhados de uma república pelo `id` com Supabase.
- Exibe informações como:
  - nome
  - gênero da república
  - cidade e estado
  - mensalidade
  - vagas disponíveis
  - universidade
  - descrição
  - comodidades
  - regras da casa
- Carrega dados do responsável/líder da república quando disponível.
- Inclui seção de galeria e botão de candidatura (`BotaoCandidatar`).

### Autenticação (`/login`)

- Formulário alterna entre login e cadastro de novo usuário.
- Usa Supabase Auth para:
  - `signInWithPassword`
  - `signUp`
- Após cadastro, realiza `upsert` na tabela `profiles` para adicionar nome do usuário.
- Redireciona o usuário de volta à rota solicitada quando não autenticado.

### Cadastro de República (`/cadastrar-republica`)

- Página atualmente com estado de "Em breve".
- Indica funcionalidade futura de registro de repúblicas.

## Camadas e Divisão de Responsabilidades

### UI e Layout

- A UI usa componentes React funcionais com o App Router do Next.js.
- O layout global define as fontes Google (Geist e Geist Mono) e as classes base.
- Há uso de estilos utilitários do Tailwind CSS diretamente em classes.
- Componentes `use client` são usados onde há necessidade de interatividade no browser.

### Dados e Backend

- A fonte de dados principal é Supabase, usando `@supabase/ssr` para compatibilidade SSR e clientes browser/server.
- O projeto separa a criação de cliente Supabase em:
  - `utils/supabase/client.ts` para browser
  - `utils/supabase/server.ts` para server
- As consultas de dados estão centralizadas em `lib/republicas.ts`.

### Autenticação e Sessão

- Autenticação com Supabase Auth.
- `BotaoCandidatar` verifica se o usuário está logado antes de redirecionar.
- O formulário de login/cadastro gerencia estado local, erros e confirmações.

## Tecnologias Utilizadas

- Next.js 16.2.6
- React 19.2.4
- TypeScript 5
- Tailwind CSS v4
- PostCSS
- ESLint 9 + `eslint-config-next`
- Supabase JS 2.106.0
- `@supabase/ssr` 0.10.3

## Configuração e Metadados

- `package.json` contém scripts padrão:
  - `dev`
  - `build`
  - `start`
  - `lint`
- `next.config.ts` mantém configuração padrão sem customizações adicionais.
- `tsconfig.json` configura:
  - `strict`
  - `moduleResolution: bundler`
  - `jsx: react-jsx`
  - alias `@/*` para caminhos absolutos.

## Observações de Implementação

- O código usa rotas dinâmicas do App Router para detalhes da república.
- O filtro de busca é realizado via query params e atualização de URL com `next/navigation`.
- O layout visual prioriza uma interface limpa com design em tons neutros e cores de destaque.
- Há uso de variáveis CSS customizadas para temas `light` e `dark`.

## Dependências Relevantes

- `next`
- `react`
- `react-dom`
- `@supabase/ssr`
- `@supabase/supabase-js`
- `tailwindcss`
- `@tailwindcss/postcss`
- `typescript`
- `eslint`
- `eslint-config-next`
- `@types/node`, `@types/react`, `@types/react-dom`

## Pontos de Extensão

- O fluxo de candidatura sugere a existência futura de rota `/candidatar/[id]`, mas essa rota não está presente no repositório atual.
- A página de cadastro de república está em construção.
- O `README.md` ainda contém conteúdo padrão do boilerplate Next.js.

## Conclusão

O projeto é uma aplicação web moderna de catálogo e busca de repúblicas estudantis, construída sobre a pilha Next.js + React + Tailwind + Supabase. A separação entre renderização server-side e componentes client-side está bem definida, e o uso de Supabase permite autenticação e consulta de dados em tempo real com pouca infraestrutura customizada.
