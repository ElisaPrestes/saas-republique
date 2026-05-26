"use client";

import { useState } from "react";
import Link from "next/link";
import TabelaCandidaturas from "@/components/dashboard/TabelaCandidaturas";
import type { RepublicaComCandidaturas } from "@/lib/candidaturas";

type Props = {
  republica: RepublicaComCandidaturas;
};

const STATUS_REPUBLICA: Record<string, { label: string; className: string }> = {
  ativa: { label: "Ativa", className: "text-emerald-600 dark:text-emerald-400" },
  pausada: { label: "Pausada", className: "text-amber-600 dark:text-amber-400" },
  inativa: { label: "Inativa", className: "text-zinc-400" },
};

export default function CardRepublicaDash({ republica }: Props) {
  const [aberto, setAberto] = useState(false);

  const pendentes = republica.candidaturas.filter((c) => c.status === "pendente").length;
  const aceitos = republica.candidaturas.filter((c) => c.status === "aceito").length;
  const total = republica.candidaturas.length;
  const statusInfo = STATUS_REPUBLICA[republica.status] ?? STATUS_REPUBLICA.inativa;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header da república */}
      <div className="flex items-start justify-between px-5 py-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
              {republica.nome}
            </h2>
            <span className={`text-xs font-medium ${statusInfo.className}`}>
              · {statusInfo.label}
            </span>
          </div>

          {/* Contadores */}
          <div className="mt-2 flex flex-wrap gap-3">
            <Stat label="Candidaturas" value={total} />
            <Stat label="Pendentes" value={pendentes} highlight={pendentes > 0} />
            <Stat label="Aceitos" value={aceitos} />
            <Stat
              label="Vagas"
              value={`${republica.vagas_disponiveis}/${republica.vagas_total}`}
            />
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="ml-4 flex shrink-0 items-center gap-2">
          <Link
            href={`/republica/${republica.slug ?? republica.id}`}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            target="_blank"
          >
            Ver página
          </Link>
          <button
            onClick={() => setAberto(!aberto)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            style={{ backgroundColor: "#171717" }}
          >
            {aberto ? "Fechar" : "Candidaturas"}
            {pendentes > 0 && !aberto && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-zinc-900">
                {pendentes}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Painel de candidaturas */}
      {aberto && (
        <div className="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <TabelaCandidaturas
            candidaturas={republica.candidaturas}
            republicaId={republica.id}
            republicaNome={republica.nome}
          />
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
      <span>{label}:</span>
      <span
        className={`font-semibold ${highlight ? "text-amber-600 dark:text-amber-400" : "text-zinc-800 dark:text-zinc-200"}`}
      >
        {value}
      </span>
    </div>
  );
}