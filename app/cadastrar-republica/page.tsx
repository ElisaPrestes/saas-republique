import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function PageCadastrarRepublica() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
          Em breve
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          O cadastro de repúblicas está sendo preparado.
        </p>
        <Link
          href="/"
          className="text-sm font-medium"
          style={{ color: "var(--blue)" }}
        >
          ← Voltar para o catálogo
        </Link>
      </div>
    </div>
  );
}