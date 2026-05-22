import { createClient } from "@/utils/supabase/server";

export type Republica = {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  descricao: string | null;
  aceita_pets: boolean;
  tem_garagem: boolean;
  mobiliada: boolean;
  internet_inclusa: boolean;
  genero: "masculino" | "feminino" | "misto";
  vagas: number;
  preco: number;
  imagem_url: string | null;
  universidade: string | null;
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

export async function getRepublicas(filtros: FiltrosRepublica = {}): Promise<Republica[]> {
  const supabase = await createClient();

  let query = supabase
    .from("republicas")
    .select("*")
    .gt("vagas", 0)
    .order("created_at", { ascending: false });

  if (filtros.estado) query = query.eq("estado", filtros.estado);
  if (filtros.genero) query = query.eq("genero", filtros.genero);
  if (filtros.pets) query = query.eq("aceita_pets", true);
  if (filtros.garagem) query = query.eq("tem_garagem", true);
  if (filtros.mobiliada) query = query.eq("mobiliada", true);
  if (filtros.internet) query = query.eq("internet_inclusa", true);
  if (filtros.preco_max) query = query.lte("preco", filtros.preco_max);
  if (filtros.busca)
    query = query.ilike("universidade", `%${filtros.busca}%`);

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar repúblicas:", error.message);
    return [];
  }

  return data as Republica[];
}