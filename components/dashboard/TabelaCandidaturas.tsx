"use client";

import { useState } from "react";
import {
  aceitarCandidatura,
  recusarCandidatura,
  type CandidaturaComPerfil,
} from "@/lib/candidaturas";

type Props = {
  candidaturas: CandidaturaComPerfil[];
  republicaId: string;
  republicaNome: string;
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pendente: {
    label: "Pendente",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  aceito: {
    label: "Aceito",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  recusado: {
    label: "Recusado",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
};

export default function TabelaCandidaturas({
  candidaturas: inicial,
  republicaId,
  republicaNome,
}: Props) {
  const [lista, setLista] = useState(inicial);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [recusandoId, setRecusandoId] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const pendentes = lista.filter((c) => c.status === "pendente");
  const respondidas = lista.filter((c) => c.status !== "pendente");

  async function handleAceitar(c: CandidaturaComPerfil) {
    setLoading(c.id);
    setErro(null);
    const result = await aceitarCandidatura(c.id, c.user_id, republicaId, republicaNome);
    if (result.status === "success") {
      setLista((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, status: "aceito", respondido_em: new Date().toISOString() } : x))
      );
    } else {
      setErro(result.message);
    }
    setLoading(null);
  }

  async function handleRecusar(c: CandidaturaComPerfil) {
    if (!motivo.trim()) return;
    setLoading(c.id);
    setErro(null);
    const result = await recusarCandidatura(c.id, c.user_id, republicaId, republicaNome, motivo);
    if (result.status === "success") {
      setLista((prev) =>
        prev.map((x) =>
          x.id === c.id
            ? { ...x, status: "recusado", respondido_em: new Date().toISOString(), motivo_recusa: motivo }
            : x
        )
      );
      setRecusandoId(null);
      setMotivo("");
    } else {
      setErro(result.message);
    }
    setLoading(null);
  }

  if (lista.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-400">
        Nenhuma candidatura recebida ainda.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">
          {erro}
        </p>
      )}

      {/* Pendentes */}
      {pendentes.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Aguardando resposta ({pendentes.length})
          </h3>
          <div className="space-y-3">
            {pendentes.map((c) => (
              <CandidaturaCard
                key={c.id}
                c={c}
                expandido={expandido === c.id}
                onToggle={() => setExpandido(expandido === c.id ? null : c.id)}
                onAceitar={() => handleAceitar(c)}
                onIniciarRecusa={() => { setRecusandoId(c.id); setMotivo(""); }}
                loading={loading === c.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Respondidas */}
      {respondidas.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Respondidas ({respondidas.length})
          </h3>
          <div className="space-y-3">
            {respondidas.map((c) => (
              <CandidaturaCard
                key={c.id}
                c={c}
                expandido={expandido === c.id}
                onToggle={() => setExpandido(expandido === c.id ? null : c.id)}
                loading={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* Modal recusa */}
      {recusandoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-1 text-base font-semibold text-zinc-900 dark:text-white">
              Recusar candidatura
            </h3>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              Informe o motivo da recusa. O candidato será notificado.
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: vagas preenchidas, perfil não compatível..."
              rows={3}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { setRecusandoId(null); setMotivo(""); }}
                className="flex-1 rounded-xl border border-zinc-200 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                disabled={!motivo.trim() || loading === recusandoId}
                onClick={() => {
                  const c = lista.find((x) => x.id === recusandoId);
                  if (c) handleRecusar(c);
                }}
                className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading === recusandoId ? "Recusando..." : "Confirmar recusa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Card individual ──────────────────────────────────────────────────────────

function CandidaturaCard({
  c,
  expandido,
  onToggle,
  onAceitar,
  onIniciarRecusa,
  loading,
}: {
  c: CandidaturaComPerfil;
  expandido: boolean;
  onToggle: () => void;
  onAceitar?: () => void;
  onIniciarRecusa?: () => void;
  loading: boolean;
}) {
  const badge = STATUS_LABEL[c.status];
  const dataFormatada = new Date(c.created_at).toLocaleDateString("pt-BR");

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          {/* Avatar inicial */}
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {c.profiles[0]?.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              {c.profiles[0]?.nome}
            </p>
            <p className="text-xs text-zinc-400">{dataFormatada}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-zinc-400 transition-transform ${expandido ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Conteúdo expandido */}
      {expandido && (
        <div className="border-t border-zinc-100 px-4 py-4 dark:border-zinc-800">
          {/* Dados de contato */}
          {c.profiles[0]?.telefone && (
            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
              </svg>
              {c.profiles[0]?.telefone}
            </div>
          )}

          {/* Mensagem */}
          <div className="mb-4">
            <p className="mb-1 text-xs font-medium text-zinc-400">Mensagem</p>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {c.mensagem}
            </p>
          </div>

          {/* Motivo recusa */}
          {c.status === "recusado" && c.motivo_recusa && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">Motivo da recusa</p>
              <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{c.motivo_recusa}</p>
            </div>
          )}

          {/* Ações — só pendente */}
          {c.status === "pendente" && onAceitar && onIniciarRecusa && (
            <div className="flex gap-2">
              <button
                onClick={onIniciarRecusa}
                disabled={loading}
                className="flex-1 rounded-xl border border-zinc-200 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Recusar
              </button>
              <button
                onClick={onAceitar}
                disabled={loading}
                className="flex-1 rounded-xl py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#171717" }}
              >
                {loading ? "Aceitando..." : "Aceitar"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}