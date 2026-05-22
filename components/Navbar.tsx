import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          Republique<span style={{ color: "var(--yellow)" }}>!</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/cadastrar-republica"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Cadastrar república
          </Link>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <Link
            href="/login"
            className="rounded-md px-4 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--blue)" }}
          >
            Entrar
          </Link>
        </div>
      </div>
    </nav>
  );
}