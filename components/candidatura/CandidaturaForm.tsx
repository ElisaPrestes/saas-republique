"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enviarCandidatura } from "@/lib/candidaturas";

const MIN_CHARS = 50;

type Props = {
  republicaId: string;
  republicaNome: string;
  slug: string;
};

export default function CandidaturaForm({ republicaId, republicaNome, slug }: Props) {
  const router = useRouter();
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chars = mensagem.trim().length;
  const valido = chars >= MIN_CHARS;
  const faltam = MIN_CHARS - chars;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valido) return;

    setLoading(true);
    setError(null);

    const result = await enviarCandidatura({ republica_id: republicaId, mensagem });

    if (result.status === "success") {
      router.push(`/republica/${slug}?candidatou=1`);
      return;
    }

    if (result.status === "already_applied") {
      router.push(`/republica/${slug}?candidatou=1`);
      return;
    }

    setError(result.message);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Contexto */}
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Candidatando-se para</p>
        <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">{republicaNome}</p>
      </div>

      {/* Textarea */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Por que você quer morar nessa república?
        </label>
        <textarea
          required
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Fale um pouco sobre você, sua rotina, por que essa república te interessa..."
          rows={5}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />

        {/* Contador */}
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {valido ? (
              <span className="text-emerald-600 dark:text-emerald-400">✓ Mensagem suficiente</span>
            ) : (
              <>Faltam <strong>{faltam}</strong> caracteres</>
            )}
          </span>
          <span className={`text-xs tabular-nums ${valido ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}>
            {chars}/{MIN_CHARS}
          </span>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!valido || loading}
        className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ backgroundColor: "#171717" }}
      >
        {loading ? "Enviando..." : "Enviar candidatura"}
      </button>
    </form>
  );
}