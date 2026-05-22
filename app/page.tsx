import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroBusca from "@/components/republicas/HeroBusca";
import SidebarFiltros from "@/components/republicas/SidebarFiltros";
import CardRepublica from "@/components/republicas/CardRepublica";
import { getRepublicas } from "@/lib/republicas";

type SearchParams = {
  estado?: string;
  genero?: string;
  pets?: string;
  garagem?: string;
  mobiliada?: string;
  internet?: string;
  preco_max?: string;
  busca?: string;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const republicas = await getRepublicas({
    estado: params.estado,
    genero: params.genero,
    pets: params.pets === "true",
    garagem: params.garagem === "true",
    mobiliada: params.mobiliada === "true",
    internet: params.internet === "true",
    preco_max: params.preco_max ? Number(params.preco_max) : undefined,
    busca: params.busca,
  });

  const estadoLabel = params.estado ? `em ${params.estado}` : "no Brasil";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <Suspense>
        <HeroBusca />
      </Suspense>

      <div className="flex flex-1">
        <Suspense>
          <SidebarFiltros />
        </Suspense>

        {/* Conteúdo principal */}
        <main className="flex-1 p-5">
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-white">
              {republicas.length}
            </span>{" "}
            {republicas.length === 1 ? "república encontrada" : "repúblicas encontradas"}{" "}
            {estadoLabel}
          </p>

          {republicas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-sm text-zinc-400">
                Nenhuma república encontrada com esses filtros.
              </p>
              <a
                href="/"
                className="mt-3 text-xs font-medium transition-opacity hover:opacity-80"
                style={{ color: "var(--blue)" }}
              >
                Limpar filtros
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {republicas.map((r) => (
                <CardRepublica key={r.id} republica={r} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}