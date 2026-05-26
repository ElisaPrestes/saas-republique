import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import CandidaturaForm from "@/components/candidatura/CandidaturaForm";

import { verificarCandidaturaServer } from "@/lib/candidaturas.server";
type Props = {
  params: Promise<{ id: string }>;
};

export default async function CandidatarPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Verifica autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/candidatar/${id}`);
  }

  // Busca república
  const { data: republica } = await supabase
    .from("republicas")
    .select("id, nome, slug, status, vagas_disponiveis")
    .eq("id", id)
    .single();

  if (!republica) {
    redirect("/");
  }

  if (republica.status !== "ativa" || republica.vagas_disponiveis === 0) {
    redirect(`/republica/${republica.slug ?? republica.id}`);
  }

  // Verifica se já se candidatou
  const { data: existente } = await supabase
    .from("candidaturas")
    .select("id")
    .eq("republica_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existente) {
    redirect(`/republica/${republica.slug ?? republica.id}?candidatou=1`);
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 px-4 py-16 dark:bg-zinc-950">
      <div className="w-full max-w-lg">
        {/* Voltar */}
        <Link
          href={`/republica/${republica.slug ?? republica.id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar para a república
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
            Enviar candidatura
          </h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            Sua mensagem será lida pelo líder da república. Seja direto e autêntico.
          </p>

          <CandidaturaForm
            republicaId={republica.id}
            republicaNome={republica.nome}
            slug={republica.slug ?? republica.id}
          />
        </div>
      </div>
    </div>
  );
}