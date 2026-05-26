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

            {user ? (
              <>
                {profile?.tipo === "lider" && (
                  <Link
                    href="/dashboard"
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => setShowModal(true)}
                  className="rounded-md px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: "var(--blue)" }}
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md px-4 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90"
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