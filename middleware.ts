import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Headers de segurança centralizados
const securityHeaders = {
    // Impede clickjacking
    "X-Frame-Options": "SAMEORIGIN",

    // Impede MIME sniffing
    "X-Content-Type-Options": "nosniff",

    // Não vaza URL completa para sites externos
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Desativa APIs que você não usa
    "Permissions-Policy":
        "camera=(), microphone=(), geolocation=(), payment=()",

    // CSP — ajuste conforme seus domínios reais
    "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-* necessário pro Next.js dev; ajuste em prod
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://images.unsplash.com https://guqpvmugibetkfqebokp.supabase.co",
        "connect-src 'self' https://guqpvmugibetkfqebokp.supabase.co wss://guqpvmugibetkfqebokp.supabase.co",
        "frame-ancestors 'none'",
    ].join("; "),
};

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    await supabase.auth.getUser();

    // Injeta todos os headers de segurança na resposta
    Object.entries(securityHeaders).forEach(([key, value]) => {
        supabaseResponse.headers.set(key, value);
    });

    return supabaseResponse;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
