import Link from "next/link";
import CadastroForm from "@/components/auth/CadastroForm";

export default function CadastroPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-semibold text-zinc-900 dark:text-white">
            Republique<span style={{ color: "var(--yellow)" }}>!</span>
          </Link>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Crie sua conta para continuar
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-5 text-base font-semibold text-zinc-900 dark:text-white">
            Criar conta
          </h1>
          <CadastroForm />
        </div>

        <p className="mt-4 text-center text-xs text-zinc-400">
          Ao continuar, você concorda com os termos de uso do Republique!
        </p>
      </div>
    </div>
  );
}