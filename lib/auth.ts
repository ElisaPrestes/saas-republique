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
        options: {
            data: {
                nome: payload.nome,
                telefone: payload.telefone,
                tipo: payload.tipo,
            },
        },
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
        return {
            status: "error",
            message: "Erro inesperado ao criar usuário.",
        };
    }

    return { status: "success" };
}
