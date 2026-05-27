"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Props = {
  republicaId: string;
  jaCandidatou: boolean;
  isLider?: boolean;
};

type StatusCandidatura = "pendente" | "aceito" | "recusado" | null;

export default function BotaoCandidatar({ republicaId, jaCandidatou, isLider }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusCandidatura>(null);

  const acabouDeCandidatar = searchParams.get("candidatou") === "1";

  // Busca o status real da candidatura
  useEffect(() => {
    if (!jaCandidatou && !acabouDeCandidatar) return;

    const supabase = createClient();

    const buscarStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("candidaturas")
        .select("status")
        .eq("republica_id", republicaId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) setStatus(data.status as StatusCandidatura);
    };

    buscarStatus();

    // Escuta mudanças em tempo real
    const channel = supabase
      .channel(`candidatura-${republicaId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "candidaturas",
          filter: `republica_id=eq.${republicaId}`,
        },
        (payload) => {
          setStatus(payload.new.status as StatusCandidatura);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [jaCandidatou, acabouDeCandidatar, republicaId]);

  // Líder
  if (isLider) {
    return (
      <button
        onClick={() => router.push("/dashboard")}
        className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
        style={{ backgroundColor: "#171717" }}
      >
        Gerenciar república
      </button>
    );
  }

  // Ainda carregando o status
  if ((jaCandidatou || acabouDeCandidatar) && status === null) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
        <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3"/>
          <path d="M21 12a9 9 0 00-9-9"/>
        </svg>
        Verificando candidatura...
      </div>
    );
  }

  // Aceito
  if (status === "aceito") {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm dark:border-emerald-800 dark:bg-emerald-950">
        <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Candidatura aceita!
        </div>
        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          Entre em contato com o responsável pela república.
        </p>
      </div>
    );
  }

  // Recusado
  if (status === "recusado") {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 py-3 text-sm dark:border-red-900 dark:bg-red-950">
        <div className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Candidatura não aprovada
        </div>
        <p className="text-xs text-red-500 dark:text-red-400">
          Você pode se candidatar a outras repúblicas.
        </p>
      </div>
    );
  }

  // Pendente
  if (status === "pendente") {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-3 text-sm font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Aguardando resposta
      </div>
    );
  }

  // Não candidatou ainda
  const handleClick = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?redirect=/candidatar/${republicaId}`);
      return;
    }
    router.push(`/candidatar/${republicaId}`);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      style={{ backgroundColor: "#171717" }}
    >
      {loading ? "Aguarde..." : "Quero me candidatar"}
    </button>
  );
}