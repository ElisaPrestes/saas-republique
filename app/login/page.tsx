"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmacao, setConfirmacao] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    if (modo === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) {
        setErro("E-mail ou senha incorretos.");
      } else {
        router.push(redirect);
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      });

      if (error) {
        setErro(error.message);
      } else if (data.user) {
        // Atualiza o perfil com o nome
        await supabase.from("profiles").upsert({ id: data.user.id, nome });
        setConfirmacao(true);
      }
    }

    setLoading(false);
  };

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
        <button
          onClick={() => { setModo("login"); setConfirmacao(false); }}
          className="mt-4 text-sm font-medium"
          style={{ color: "var(--blue)" }}
        >
          Ir para o login
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Tabs login / cadastro */}
      <div className="mb-6 flex rounded-xl border border-zinc-200 p-1 dark:border-zinc-800">
        {(["login", "cadastro"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setModo(m); setErro(""); }}
            className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors"
            style={
              modo === m
                ? { background: "var(--yellow)", color: "#3a2e00" }
                : { color: "#71717a" }
            }
          >
            {m === "login" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {modo === "cadastro" && (
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
        )}

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

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Senha
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>

        {erro && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: "#171717" }}
        >
          {loading ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      {redirect !== "/" && (
        <p className="mt-4 text-center text-xs text-zinc-400">
          Você será redirecionado após o login.
        </p>
      )}
    </>
  );
}

export default function PageLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-semibold text-zinc-900 dark:text-white">
            Republique<span style={{ color: "var(--yellow)" }}>!</span>
          </Link>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Entre para se candidatar a uma república
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-400">
          Ao continuar, você concorda com os termos de uso do Republique!
        </p>
      </div>
    </div>
  );
}