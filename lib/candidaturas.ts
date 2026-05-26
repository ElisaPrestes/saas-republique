import { createClient } from "@/utils/supabase/client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CandidaturaPayload {
  republica_id: string;
  mensagem: string;
}

export interface CandidaturaComPerfil {
  id: string;
  republica_id: string;
  user_id: string;
  mensagem: string;
  status: "pendente" | "aceito" | "recusado";
  created_at: string;
  respondido_em: string | null;
  motivo_recusa: string | null;
  profiles: {
    nome: string;
    telefone: string | null;
    avatar_url: string | null;
  }[];
}

export interface RepublicaComCandidaturas {
  id: string;
  nome: string;
  slug: string | null;
  status: string;
  vagas_total: number;
  vagas_disponiveis: number;
  candidaturas: CandidaturaComPerfil[];
}

export type CandidaturaResult =
  | { status: "success" }
  | { status: "already_applied" }
  | { status: "error"; message: string };

export type AcaoResult =
  | { status: "success" }
  | { status: "error"; message: string };

// ─── Candidato: enviar candidatura ────────────────────────────────────────────

export async function enviarCandidatura(
  payload: CandidaturaPayload
): Promise<CandidaturaResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "Usuário não autenticado." };

  // Verifica se já se candidatou
  const { data: existing } = await supabase
    .from("candidaturas")
    .select("id")
    .eq("republica_id", payload.republica_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return { status: "already_applied" };

  // Insere candidatura
  const { data: candidatura, error } = await supabase
    .from("candidaturas")
    .insert({
      republica_id: payload.republica_id,
      user_id: user.id,
      mensagem: payload.mensagem,
      status: "pendente",
    })
    .select("id")
    .single();

  if (error || !candidatura) {
    return { status: "error", message: error?.message ?? "Erro ao enviar candidatura." };
  }

  // Busca lider_id da república para notificar
  const { data: republica } = await supabase
    .from("republicas")
    .select("lider_id, nome")
    .eq("id", payload.republica_id)
    .single();

  if (republica?.lider_id) {
    await supabase.from("notificacoes").insert({
      user_id: republica.lider_id,
      tipo: "nova_candidatura",
      payload: {
        candidatura_id: candidatura.id,
        republica_id: payload.republica_id,
        republica_nome: republica.nome,
        candidato_id: user.id,
      },
    });
  }

  return { status: "success" };
}

// ─── Líder: aceitar candidatura ───────────────────────────────────────────────

export async function aceitarCandidatura(
  candidaturaId: string,
  candidatoId: string,
  republicaId: string,
  republicaNome: string
): Promise<AcaoResult> {
  const supabase = createClient();

  const { error } = await supabase
    .from("candidaturas")
    .update({
      status: "aceito",
      respondido_em: new Date().toISOString(),
    })
    .eq("id", candidaturaId);

  if (error) return { status: "error", message: error.message };

  await supabase.from("notificacoes").insert({
    user_id: candidatoId,
    tipo: "candidatura_aceita",
    payload: {
      candidatura_id: candidaturaId,
      republica_id: republicaId,
      republica_nome: republicaNome,
    },
  });

  return { status: "success" };
}

// ─── Líder: recusar candidatura ───────────────────────────────────────────────

export async function recusarCandidatura(
  candidaturaId: string,
  candidatoId: string,
  republicaId: string,
  republicaNome: string,
  motivo: string
): Promise<AcaoResult> {
  const supabase = createClient();

  const { error } = await supabase
    .from("candidaturas")
    .update({
      status: "recusado",
      respondido_em: new Date().toISOString(),
      motivo_recusa: motivo,
    })
    .eq("id", candidaturaId);

  if (error) return { status: "error", message: error.message };

  await supabase.from("notificacoes").insert({
    user_id: candidatoId,
    tipo: "candidatura_recusada",
    payload: {
      candidatura_id: candidaturaId,
      republica_id: republicaId,
      republica_nome: republicaNome,
      motivo,
    },
  });

  return { status: "success" };
}