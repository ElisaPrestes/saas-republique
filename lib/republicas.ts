import { createClient } from "@/utils/supabase/server";

// -------------------------------------------------------------
// Tipos
// -------------------------------------------------------------

export type Endereco = {
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep?: string;
  lat?: number;
  lng?: number;
};

export type RepublicaFoto = {
  url: string;
  ordem: number;
  legenda: string | null;
};

export type Lider = {
  nome: string;
  telefone: string | null;
  avatar_url: string | null;
};

// Shape retornado pela listagem (sem fotos para não pesar)
export type Republica = {
  id: string;
  nome: string;
  slug: string | null;
  descricao: string | null;
  universidade: string | null;
  endereco: Endereco;
  genero: "masculino" | "feminino" | "misto";
  vagas_total: number;
  vagas_disponiveis: number;
  preco_mensal: number;
  aceita_pets: boolean;
  tem_garagem: boolean;
  mobiliada: boolean;
  internet_inclusa: boolean;
  status: "ativa" | "pausada" | "inativa";
  // Primeira foto (capa) vinda do join com republica_fotos
  republica_fotos: Pick<RepublicaFoto, "url">[];
};

// Shape completo usado na página de detalhes
// Omit garante que republica_fotos seja sobrescrito com o tipo completo
export type RepublicaDetalhes = Omit<Republica, "republica_fotos"> & {
  lider_id: string | null;
  republica_fotos: RepublicaFoto[];
  profiles: Lider | null;
};

export type FiltrosRepublica = {
  estado?: string;
  genero?: string;
  pets?: boolean;
  garagem?: boolean;
  mobiliada?: boolean;
  internet?: boolean;
  preco_max?: number;
  busca?: string;
};

// -------------------------------------------------------------
// Listagem (página inicial)
// -------------------------------------------------------------

export async function getRepublicas(
  filtros: FiltrosRepublica = {}
): Promise<Republica[]> {
  const supabase = await createClient();

  // Traz apenas a primeira foto de cada república (ordem 0 = capa)
  let query = supabase
    .from("republicas")
    .select(`
      id, nome, slug, descricao, universidade,
      endereco, genero,
      vagas_total, vagas_disponiveis,
      preco_mensal,
      aceita_pets, tem_garagem, mobiliada, internet_inclusa,
      status,
      republica_fotos ( url, ordem )
    `)
    .eq("status", "ativa")
    .gt("vagas_disponiveis", 0)
    .order("created_at", { ascending: false })
    .order("ordem", { referencedTable: "republica_fotos", ascending: true })
    .limit(1, { referencedTable: "republica_fotos" });

  // Filtros em colunas diretas
  if (filtros.genero)   query = query.eq("genero", filtros.genero);
  if (filtros.pets)     query = query.eq("aceita_pets", true);
  if (filtros.garagem)  query = query.eq("tem_garagem", true);
  if (filtros.mobiliada) query = query.eq("mobiliada", true);
  if (filtros.internet) query = query.eq("internet_inclusa", true);
  if (filtros.preco_max) query = query.lte("preco_mensal", filtros.preco_max);

  // Filtros em colunas jsonb do endereco
  if (filtros.estado)
    query = query.eq("endereco->>estado", filtros.estado);

  // Busca por universidade ou cidade
  if (filtros.busca)
    query = query.or(
      `universidade.ilike.%${filtros.busca}%,endereco->>cidade.ilike.%${filtros.busca}%`
    );

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar repúblicas:", error.message);
    return [];
  }

  return (data ?? []) as Republica[];
}

// -------------------------------------------------------------
// Detalhe (página /republica/[id])
// -------------------------------------------------------------

export async function getRepublicaById(
  id: string
): Promise<RepublicaDetalhes | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("republicas")
    .select(`
      id, nome, slug, descricao, universidade,
      endereco, genero,
      vagas_total, vagas_disponiveis,
      preco_mensal,
      aceita_pets, tem_garagem, mobiliada, internet_inclusa,
      status,
      republica_fotos ( url, ordem, legenda ),
      profiles!lider_id ( nome, telefone, avatar_url )
    `)
    .eq("id", id)
    .order("ordem", { referencedTable: "republica_fotos", ascending: true })
    .single();

  if (error || !data) return null;

  // O Supabase tipifica joins como array mesmo quando é relação 1:1.
  // Normalizamos profiles para objeto singular antes do cast.
  const normalized = {
    ...data,
    profiles: Array.isArray(data.profiles)
      ? (data.profiles[0] ?? null)
      : data.profiles,
  };

  return normalized as unknown as RepublicaDetalhes;
}

export async function getRepublicaBySlug(
  slug: string
): Promise<RepublicaDetalhes | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("republicas")
    .select(`
      id, nome, slug, lider_id, descricao, universidade,
      endereco, genero,
      vagas_total, vagas_disponiveis,
      preco_mensal,
      aceita_pets, tem_garagem, mobiliada, internet_inclusa,
      status,
      republica_fotos ( url, ordem, legenda ),
      profiles!lider_id ( nome, telefone, avatar_url )
    `)
    .eq("slug", slug)
    .order("ordem", { referencedTable: "republica_fotos", ascending: true })
    .single();

  if (error || !data) return null;

  const normalized = {
    ...data,
    profiles: Array.isArray(data.profiles)
      ? (data.profiles[0] ?? null)
      : data.profiles,
  };

  return normalized as unknown as RepublicaDetalhes;
}