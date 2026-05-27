# Republique! 🏠

> Encontre repúblicas estudantis em todo o Brasil — filtre por cidade, universidade e perfil, e candidate-se em poucos cliques.

🔗 **[republique.vercel.app](https://republique.vercel.app)**

---

## Sobre o projeto

O **Republique!** é uma plataforma web que conecta estudantes a repúblicas disponíveis em todo o Brasil. Com mais de 50 repúblicas cadastradas em todas as regiões do país, o estudante encontra opções filtradas por estado, cidade, universidade, gênero e características do imóvel **tudo em um só lugar**.

O projeto nasceu da dificuldade real de encontrar moradia estudantil de forma centralizada e confiável, especialmente para quem está ingressando numa universidade em outra cidade.

---

## Funcionalidades

- **Listagem de repúblicas** com informações de vagas, valor mensal, gênero e características
- **Filtros por estado** — SP, RJ, MG, RS, PR, SC, BA, AM e mais
- **Filtros por perfil** — gênero (masculino, feminino, misto), mobiliado, aceita pets, estacionamento, internet inclusa
- **Cadastro de república** para proprietários e moradores anunciarem vagas
- **Página individual** por república com detalhes completos
- **Autenticação de usuários**

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (App Router) |
| Backend / BaaS | Supabase (PostgreSQL + Auth + RLS) |
| Deploy | Vercel |
| Linguagem | TypeScript |

---

## Estrutura do projeto

```
republique/
├── app/
│   ├── page.tsx                  # Listagem principal
│   ├── cadastrar-republica/      # Formulário de cadastro
│   ├── login/                    # Autenticação
│   └── republica/[slug]/         # Página individual
├── components/
├── lib/
│   └── supabase/                 # Client, tipos e queries
├── types/
└── public/
```

---

## Como rodar localmente

**Pré-requisitos:** Node.js 18+ e uma conta no [Supabase](https://supabase.com)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/republique.git
cd republique

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

Preencha o `.env.local` com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

```bash
# Rode o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

---

## Banco de dados

O projeto usa **Supabase** com PostgreSQL. O schema inclui:

- Row Level Security (RLS) em todas as tabelas
- Triggers para consistência de dados
- Índices para performance nas buscas por cidade, universidade e slug
- Tipos TypeScript gerados a partir do schema

---

## Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feat/nome-da-feature`
3. Commit seguindo Conventional Commits: `feat: adiciona filtro por preço`
4. Abra um Pull Request

---

## Autora

Desenvolvido por
**Bruna Elisa Prestes** — estudante de Engenharia de Computação na UNISO, Sorocaba/SP.

---

## Licença
MIT