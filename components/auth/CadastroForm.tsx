"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth";

export default function CadastroForm() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState<"estudante" | "lider">("estudante");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmacao, setConfirmacao] = useState(false);

  function formatTelefone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signUp({ email, password, nome, telefone, tipo });

    if (result.status === "success") {
      setConfirmacao(true);
      setLoading(false);
      return;
    }

    if (result.status === "email_in_use") {
      router.push(`/login?email=${encodeURIComponent(email)}&hint=email_in_use`);
      return;
    }

    setError(result.message);
    setLoading(false);
  }

  if (confirmacao) {
    return (
      <div className="text-center">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "var(--yellow-light)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7a5c00" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
          Confirme seu e-mail
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enviamos um link de confirmação para <strong>{email}</strong>. Após confirmar, faça login.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium"
          style={{ color: "var(--blue)" }}
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Nome */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Nome completo
        </label>
        <input
          type="text"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      {/* E-mail */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          E-mail
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      {/* Telefone */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Telefone / WhatsApp
        </label>
        <input
          type="tel"
          required
          value={telefone}
          onChange={(e) => setTelefone(formatTelefone(e.target.value))}
          placeholder="(11) 99999-9999"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      {/* Tipo de conta */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Você é...
        </label>
        <div className="flex rounded-xl border border-zinc-200 p-1 dark:border-zinc-800">
          {(["estudante", "lider"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors"
              style={
                tipo === t
                  ? { background: "var(--yellow)", color: "#3a2e00" }
                  : { color: "#71717a" }
              }
            >
              {t === "estudante" ? "Estudante buscando vaga" : "Líder de república"}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          {tipo === "estudante"
            ? "Você poderá se candidatar a vagas em repúblicas."
            : "Você poderá cadastrar e gerenciar repúblicas."}
        </p>
      </div>

      {/* Senha */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Senha
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: "#171717" }}
      >
        {loading ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-xs text-zinc-400">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-zinc-700 hover:underline dark:text-zinc-300">
          Entrar
        </Link>
      </p>
    </form>
  );
}