import { createClient } from "@/utils/supabase/client";

export type AuthResult =
  | { status: "success" }
  | { status: "email_in_use" }
  | { status: "error"; message: string };

export interface SignUpPayload {
  email: string;
  password: string;
  nome: string;
  telefone: string;
  tipo: "estudante" | "lider";
}

export async function signUp(payload: SignUpPayload): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    if (
      error.message.toLowerCase().includes("user already registered") ||
      error.message.toLowerCase().includes("already been registered") ||
      error.status === 422
    ) {
      return { status: "email_in_use" };
    }
    return { status: "error", message: error.message };
  }

  if (!data.user) {
    return { status: "error", message: "Erro inesperado ao criar usuário." };
  }

  // Cria o perfil com os dados adicionais
  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    nome: payload.nome,
    telefone: payload.telefone,
    tipo: payload.tipo,
  });

  if (profileError) {
    return { status: "error", message: "Conta criada, mas houve um erro ao salvar o perfil." };
  }

  return { status: "success" };
}