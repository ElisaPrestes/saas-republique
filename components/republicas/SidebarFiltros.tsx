"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

export default function SidebarFiltros() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [preco, setPreco] = useState(Number(searchParams.get("preco_max")) || 3000);
  const [drawerAberto, setDrawerAberto] = useState(false);

  // Fecha o drawer com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerAberto(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Trava scroll do body quando drawer aberto
  useEffect(() => {
    document.body.style.overflow = drawerAberto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerAberto]);

  const set = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const toggle = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(key)) params.delete(key);
      else params.set(key, "true");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const limpar = () => {
    setPreco(3000);
    router.push(pathname);
  };

  // Conta filtros ativos pro badge
  const filtrosAtivos = [
    searchParams.get("genero"),
    searchParams.get("mobiliada"),
    searchParams.get("pets"),
    searchParams.get("garagem"),
    searchParams.get("internet"),
    searchParams.get("preco_max"),
  ].filter(Boolean).length;

  const labelClass = "text-[10px] font-medium uppercase tracking-widest text-zinc-400 mb-2 block";
  const divider = <div className="my-4 h-px bg-zinc-100 dark:bg-zinc-800" />;

  const conteudoFiltros = (
    <>
      {/* Preço máximo */}
      <span className={labelClass}>Preço máximo</span>
      <div className="mb-1 flex justify-between text-xs text-zinc-400">
        <span>R$ 0</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          R$ {preco.toLocaleString("pt-BR")}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={3000}
        step={50}
        value={preco}
        className="w-full"
        style={{ accentColor: "var(--yellow)" }}
        onChange={(e) => setPreco(Number(e.target.value))}
        onMouseUp={() => set("preco_max", preco < 3000 ? String(preco) : null)}
        onTouchEnd={() => set("preco_max", preco < 3000 ? String(preco) : null)}
      />

      {divider}

      {/* Gênero */}
      <span className={labelClass}>Gênero</span>
      <select
        className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        value={searchParams.get("genero") || ""}
        onChange={(e) => set("genero", e.target.value || null)}
      >
        <option value="">Todos</option>
        <option value="masculino">Masculino</option>
        <option value="feminino">Feminino</option>
        <option value="misto">Misto</option>
      </select>

      {divider}

      {/* Características */}
      <span className={labelClass}>Características</span>
      <div className="flex flex-col gap-2.5">
        {[
          { key: "mobiliada", label: "Mobiliado" },
          { key: "pets",      label: "Aceita pets" },
          { key: "garagem",   label: "Com estacionamento" },
          { key: "internet",  label: "Internet inclusa" },
        ].map(({ key, label }) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300"
          >
            <input
              type="checkbox"
              checked={!!searchParams.get(key)}
              onChange={() => toggle(key)}
              style={{ accentColor: "var(--yellow)" }}
            />
            {label}
          </label>
        ))}
      </div>

      {divider}

      <button
        onClick={limpar}
        className="text-xs font-medium transition-colors hover:opacity-80"
        style={{ color: "var(--blue)" }}
      >
        Limpar filtros
      </button>
    </>
  );

  return (
    <>
      {/* ── DESKTOP: sidebar fixa ── */}
      <aside className="hidden lg:block w-52 shrink-0 border-r border-zinc-200 bg-white px-4 py-5 dark:border-zinc-800 dark:bg-zinc-950">
        {conteudoFiltros}
      </aside>

      {/* ── MOBILE: botão flutuante ── */}
      <div className="lg:hidden fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
        <button
          onClick={() => setDrawerAberto(true)}
          className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-opacity hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#171717", color: "#fff" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Filtros
          {filtrosAtivos > 0 && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ backgroundColor: "var(--yellow)", color: "#3a2e00" }}
            >
              {filtrosAtivos}
            </span>
          )}
        </button>
      </div>

      {/* ── MOBILE: drawer ── */}
      {drawerAberto && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerAberto(false)}
          />

          {/* Painel */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-zinc-200 bg-white px-5 pb-8 pt-5 dark:border-zinc-800 dark:bg-zinc-950"
            style={{ maxHeight: "85dvh", overflowY: "auto" }}
          >
            {/* Handle + header */}
            <div className="mb-1 flex justify-center">
              <div className="h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>
            <div className="mb-5 mt-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">Filtros</p>
              <button
                onClick={() => setDrawerAberto(false)}
                className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {conteudoFiltros}

            {/* Botão aplicar */}
            <button
              onClick={() => setDrawerAberto(false)}
              className="mt-5 w-full rounded-xl py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: "#171717" }}
            >
              Ver resultados
            </button>
          </div>
        </>
      )}
    </>
  );
}