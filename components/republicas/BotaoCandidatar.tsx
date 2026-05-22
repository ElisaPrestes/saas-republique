"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function BotaoCandidatar({ republicaId }: { republicaId: string }) {
  const router = useRouter();

  const handleClick = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Não logado: redireciona para login com redirect de volta
      router.push(`/login?redirect=/candidatar/${republicaId}`);
    } else {
      // Logado: vai direto para o formulário de candidatura
      router.push(`/candidatar/${republicaId}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
      style={{ backgroundColor: "#171717" }}
    >
      Quero me candidatar
    </button>
  );
}