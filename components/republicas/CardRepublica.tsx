"use client";

import Link from "next/link";
import Image from "next/image";
import { Republica } from "@/lib/republicas";

const generoLabel: Record<Republica["genero"], string> = {
  masculino: "Masculina",
  feminino: "Feminina",
  misto: "Mista",
};

export default function CardRepublica({ republica }: { republica: Republica }) {
  // Primeira foto já vem ordenada pela query (ordem ASC, limit 1)
  const capaUrl = republica.republica_fotos?.[0]?.url ?? null;

  const { cidade, estado } = republica.endereco;

  return (
    <Link href={`/republica/${republica.id}`} className="group block">
      <div
        className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-900"
        style={{ boxShadow: "0 0 0 transparent" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 4px 20px 0 rgba(245,200,66,0.28), 0 1px 4px 0 rgba(120,110,80,0.10)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--yellow)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 transparent";
          (e.currentTarget as HTMLDivElement).style.borderColor = "";
        }}
      >
        {/* Imagem de capa */}
        <div className="relative h-40 w-full bg-zinc-100 dark:bg-zinc-800">
          {capaUrl ? (
            <Image
              src={capaUrl}
              alt={republica.nome}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-300 dark:text-zinc-600">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}

          {/* Badge vagas disponíveis */}
          <span
            className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: "var(--yellow-light)", color: "#7a5c00" }}
          >
            {republica.vagas_disponiveis}{" "}
            {republica.vagas_disponiveis === 1 ? "vaga" : "vagas"}
          </span>
        </div>

        {/* Corpo */}
        <div className="p-3">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
            {republica.nome}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            {republica.universidade && `${republica.universidade} · `}
            {cidade}, {estado}
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">
            R$ {republica.preco_mensal.toLocaleString("pt-BR")}
            <span className="ml-1 text-xs font-normal text-zinc-400">/ mês</span>
          </p>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ background: "var(--blue-light)", color: "#0c447c" }}
            >
              {generoLabel[republica.genero]}
            </span>
            {republica.aceita_pets && (
              <span
                className="rounded-full border px-2 py-0.5 text-xs font-medium"
                style={{
                  background: "var(--yellow-light)",
                  borderColor: "var(--yellow)",
                  color: "#7a5c00",
                }}
              >
                Pets
              </span>
            )}
            {republica.tem_garagem && (
              <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                Garagem
              </span>
            )}
            {republica.mobiliada && (
              <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                Mobiliada
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
