import { createClient } from "@/utils/supabase/server";
import type { RepublicaComCandidaturas } from "@/lib/candidaturas";

export async function verificarCandidaturaServer(
  userId: string,
  republicaId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidaturas")
    .select("id")
    .eq("user_id", userId)
    .eq("republica_id", republicaId)
    .maybeSingle();
  return !!data;
}

export async function getRepublicasComCandidaturas(
  liderId: string
): Promise<RepublicaComCandidaturas[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("republicas")
    .select(`
      id, nome, slug, status, vagas_total, vagas_disponiveis,
      candidaturas (
        id, republica_id, user_id, mensagem, status,
        created_at, respondido_em, motivo_recusa
      )
    `)
    .eq("lider_id", liderId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  // Coleta todos os user_ids únicos das candidaturas
  const userIds = [
    ...new Set(data.flatMap((r) => r.candidaturas.map((c) => c.user_id))),
  ];

  // Busca os perfis de uma vez
  const { data: perfis } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, nome, telefone, avatar_url")
        .in("id", userIds)
    : { data: [] };

  const perfilMap = Object.fromEntries((perfis ?? []).map((p) => [p.id, p]));

  return data.map((r) => ({
    ...r,
    candidaturas: r.candidaturas.map((c) => ({
      ...c,
      profiles: perfilMap[c.user_id] ?? null,
    })),
  })) as unknown as RepublicaComCandidaturas[];
}