import LoginForm from "@/components/auth/LoginForm";

type Props = {
  searchParams: Promise<{ email?: string; hint?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { email, hint } = await searchParams;
  const emailHint = email ?? "";
  const showHint = hint === "email_in_use";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <a href="/" className="text-2xl font-semibold text-zinc-900 dark:text-white">
            Republique<span style={{ color: "var(--yellow)" }}>!</span>
          </a>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Entre para se candidatar a uma república
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-5 text-base font-semibold text-zinc-900 dark:text-white">Entrar</h1>

          {showHint && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Este e-mail já possui uma conta. Entre com sua senha abaixo.
            </div>
          )}

          <LoginForm defaultEmail={emailHint} />
        </div>

        <p className="mt-4 text-center text-xs text-zinc-400">
          Ao continuar, você concorda com os termos de uso do Republique!
        </p>
      </div>
    </div>
  );
}