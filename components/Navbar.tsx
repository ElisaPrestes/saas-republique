"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import LogoutModal from "@/components/ui/LogoutModal";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ tipo: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("profiles")
          .select("tipo")
          .eq("id", data.user.id)
          .single()
          .then(({ data: p }) => setProfile(p));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("tipo")
          .eq("id", session.user.id)
          .single()
          .then(({ data: p }) => setProfile(p));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showModal]);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setShowModal(false);
    setLoggingOut(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white"
          >
            Republique<span style={{ color: "var(--yellow)" }}>!</span>
          </Link>

          {/* Ações */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* "Cadastrar república" — texto no desktop, ícone no mobile */}
            <Link
              href="/cadastrar-republica"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              {/* Ícone sempre visível */}
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <line x1="12" y1="12" x2="12" y2="18" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              {/* Texto só no desktop */}
              <span className="hidden sm:inline">Cadastrar república</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

            {user ? (
              <>
                {profile?.tipo === "lider" && (
                  <Link
                    href="/dashboard"
                    className="hidden sm:block text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => setShowModal(true)}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer sm:px-4"
                  style={{ backgroundColor: "var(--blue)" }}
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90 sm:px-4"
                style={{ backgroundColor: "var(--blue)" }}
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {showModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => !loggingOut && setShowModal(false)}
          loading={loggingOut}
        />
      )}
    </>
  );
}