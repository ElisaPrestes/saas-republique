"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type Props = {
  republicaId: string;
  jaCandidatou: boolean;
};

export default function BotaoCandidatar({ republicaId, jaCandidatou }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (jaCandidatou) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-400 dark:border-zinc-700">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Candidatura enviada
      </div>
    );
  }

  const handleClick = async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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
