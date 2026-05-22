import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import BotaoCandidatar from "@/components/republicas/BotaoCandidatar";

type Params = { id: string };

async function getRepublica(id: string) {
  const supabase = await createClient();
  
  // Busca a república sem o join problemático
  const { data, error } = await supabase
    .from("republicas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  // Busca o perfil do líder separadamente se houver lider_id
  if (data.lider_id) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("nome, contato")
      .eq("id", data.lider_id)
      .single();

    return { ...data, profiles: perfil ?? null };
  }

  return { ...data, profiles: null };
}

const generoLabel: Record<string, string> = {
  masculino: "Masculina",
  feminino: "Feminina",
  misto: "Mista",
};

export default async function PageRepublica({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const republica = await getRepublica(id);
  if (!republica) notFound();

  const lider = republica.profiles as { nome: string; contato: string } | null;

  // Características como chips
  const comodidades = [
    republica.internet_inclusa && "Wi-Fi",
    republica.mobiliada && "Mobiliado",
    republica.aceita_pets && "Aceita Pets",
    republica.tem_garagem && "Estacionamento",
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Voltar */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Voltar para listagem
        </Link>

        {/* Galeria de fotos */}
        <div className="mb-8 grid h-72 grid-cols-3 gap-2 overflow-hidden rounded-2xl">
          {/* Foto principal */}
          <div className="relative col-span-2">
            {republica.imagem_url ? (
              <Image src={republica.imagem_url} alt={republica.nome} fill className="object-cover" />
            ) : (
              <div className="h-full w-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
            )}
          </div>
          {/* Fotos secundárias */}
          <div className="flex flex-col gap-2">
            <div className="relative flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div className="relative flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          </div>
        </div>

        {/* Layout: conteúdo + sidebar */}
        <div className="flex gap-8">

          {/* Coluna principal */}
          <div className="flex-1 min-w-0">

            {/* Nome + badge + endereço */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {republica.nome}
                </h1>
                <span
                  className="rounded-full px-3 py-1 text-sm font-medium"
                  style={{ background: "var(--yellow)", color: "#3a2e00" }}
                >
                  {generoLabel[republica.genero] ?? republica.genero}
                </span>
              </div>
              {republica.cidade && (
                <p className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {republica.cidade && republica.estado
                    ? `${republica.cidade}, ${republica.estado}`
                    : republica.cidade}
                </p>
              )}
            </div>

            {/* Cards de stats */}
            <div className="mb-6 grid grid-cols-4 gap-3">
              {[
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  ),
                  label: "FACULDADE",
                  value: republica.universidade ?? "—",
                  sub: republica.cidade ?? "",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  ),
                  label: "VAGAS",
                  value: `${republica.vagas}/6`,
                  sub: "disponíveis",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  ),
                  label: "MENSALIDADE",
                  value: `R$ ${Number(republica.preco).toLocaleString("pt-BR")}`,
                  sub: "por mês",
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  ),
                  label: "QUARTO",
                  value: "Individual",
                  sub: "tipo",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-1.5 flex items-center gap-1.5 text-zinc-400">
                    {stat.icon}
                    <span className="text-[10px] font-semibold uppercase tracking-widest">
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-base font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-zinc-400">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="mb-5 h-px bg-zinc-100 dark:bg-zinc-800" />

            {/* Descrição */}
            {republica.descricao && (
              <p className="mb-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {republica.descricao}
              </p>
            )}

            {/* Comodidades */}
            {comodidades.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-base font-bold text-zinc-900 dark:text-white">Comodidades</h2>
                <div className="flex flex-wrap gap-2">
                  {comodidades.map((c) => (
                    <span
                      key={c}
                      className="rounded-full px-3 py-1.5 text-sm font-medium"
                      style={{ background: "var(--yellow-light)", color: "#7a5c00", border: "1px solid var(--yellow)" }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Regras da casa */}
            <div className="mb-6">
              <h2 className="mb-3 text-base font-bold text-zinc-900 dark:text-white">Regras da casa</h2>
              <ul className="space-y-2">
                {["Silêncio após 22h", "Limpeza por escala", "Visitas com aviso prévio"].map((regra) => (
                  <li key={regra} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-zinc-400">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    {regra}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar sticky */}
          <div className="w-72 shrink-0">
            <div className="sticky top-20 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="mb-1 text-xs text-zinc-400">Mensalidade</p>
              <p className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
                R$ {Number(republica.preco).toLocaleString("pt-BR")}
                <span className="ml-1 text-sm font-normal text-zinc-400">/mês</span>
              </p>

              <BotaoCandidatar republicaId={republica.id} />

              {/* Responsável */}
              {lider && (
                <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Responsável
                  </p>
                  <div className="space-y-1.5">
                    {lider.nome && (
                      <p className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                        {lider.nome}
                      </p>
                    )}
                    {lider.contato && (
                      <p className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 0116.92 2a2 2 0 012 1.72v3a2 2 0 01-1.45 1.93A16.09 16.09 0 0014 9.9" />
                        </svg>
                        {lider.contato}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}