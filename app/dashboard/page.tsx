import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { getRepublicasComCandidaturas } from "@/lib/candidaturas.server";
import CardRepublicaDash from "@/components/dashboard/CardRepublicaDash";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Guard: autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  // Guard: tipo lider
  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, tipo")
    .eq("id", user.id)
    .single();

  if (!profile || profile.tipo !== "lider") {
    redirect("/");
  }

  // Dados
  const republicas = await getRepublicasComCandidaturas(user.id);

  const totalPendentes = republicas.reduce(
    (acc, r) => acc + r.candidaturas.filter((c) => c.status === "pendente").length,
    0
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-white">
              Republique<span style={{ color: "var(--yellow)" }}>!</span>
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Dashboard do líder</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">{profile.nome}</p>
            <p className="text-xs text-zinc-400">Líder</p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Sumário */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Suas repúblicas
            </h1>
            {totalPendentes > 0 && (
              <p className="mt-0.5 text-sm text-amber-600 dark:text-amber-400">
                {totalPendentes} candidatura{totalPendentes > 1 ? "s" : ""} aguardando resposta
              </p>
            )}
          </div>
          <Link
            href="/cadastrar-republica"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: "#171717" }}
          >
            + Nova república
          </Link>
        </div>

        {/* Lista */}
        {republicas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Você ainda não cadastrou nenhuma república.
            </p>
            <Link
              href="/cadastrar-republica"
              className="mt-3 inline-block text-sm font-semibold text-zinc-900 underline dark:text-white"
            >
              Cadastrar agora
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {republicas.map((r) => (
              <CardRepublicaDash key={r.id} republica={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}