"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback } from "react";

const ESTADOS_DESTAQUE = ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "AM"];

export default function HeroBusca() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState(searchParams.get("busca") || "");

  const estadoAtivo = searchParams.get("estado");

  const setEstado = useCallback(
    (estado: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get("estado") === estado) params.delete("estado");
      else params.set("estado", estado);
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (busca.trim()) params.set("busca", busca.trim());
    else params.delete("busca");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="border-b border-zinc-200 bg-white px-6 py-7 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="mb-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Repúblicas universitárias selecionadas, perto da sua faculdade.
        Encontre a sua e candidate-se em poucos cliques.
      </p>

      {/* Barra de busca */}
      <form onSubmit={handleBusca} className="mx-auto mb-5 flex max-w-lg overflow-hidden rounded-lg border border-zinc-300 focus-within:border-[var(--blue)] dark:border-zinc-700">
        <div className="flex items-center pl-3 text-zinc-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Nome da universidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--blue)" }}
        >
          Buscar
        </button>
      </form>

      {/* Pills de estado */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {ESTADOS_DESTAQUE.map((uf) => (
          <button
            key={uf}
            onClick={() => setEstado(uf)}
            className="rounded px-2.5 py-1 text-xs font-medium transition-colors"
            style={
              estadoAtivo === uf
                ? { background: "var(--blue)", color: "#fff", border: "none" }
                : {
                    background: "white",
                    color: "#71717a",
                    border: "0.5px solid #d4d4d8",
                  }
            }
          >
            {uf}
          </button>
        ))}
      </div>
    </div>
  );
}   