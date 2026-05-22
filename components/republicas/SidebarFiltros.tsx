"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function SidebarFiltros() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [preco, setPreco] = useState(Number(searchParams.get("preco_max")) || 3000);

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

  const labelClass = "text-[10px] font-medium uppercase tracking-widest text-zinc-400 mb-2 block";
  const divider = <div className="my-4 h-px bg-zinc-100 dark:bg-zinc-800" />;

  return (
    <aside className="w-52 shrink-0 border-r border-zinc-200 bg-white px-4 py-5 dark:border-zinc-800 dark:bg-zinc-950">

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

      {/* Tipo de quarto */}
      <span className={labelClass}>Tipo de quarto</span>
      <select
        className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
        value={searchParams.get("tipo") || ""}
        onChange={(e) => set("tipo", e.target.value || null)}
      >
        <option value="">Todos</option>
        <option value="individual">Individual</option>
        <option value="compartilhado">Compartilhado</option>
      </select>

      {divider}

      {/* Características */}
      <span className={labelClass}>Características</span>
      <div className="flex flex-col gap-2.5">
        {[
          { key: "mobiliada", label: "Mobiliado" },
          { key: "pets", label: "Aceita pets" },
          { key: "garagem", label: "Com estacionamento" },
          { key: "internet", label: "Internet inclusa" },
        ].map(({ key, label }) => (
          <label key={key} className="flex cursor-pointer items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
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
    </aside>
  );
}