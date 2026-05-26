"use client";

import { useState, useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

const IconBase = ({ children, size = 20, color = "currentColor", strokeWidth = 2, style }: IconProps & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

const Upload = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M12 3v12M8 7l4-4 4 4M4 21h16" />
  </IconBase>
);

const X = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </IconBase>
);

const Plus = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M12 5v14M5 12h14" />
  </IconBase>
);

const ChevronRight = (props: IconProps) => (
  <IconBase {...props}>
    <path d="m9 18 6-6-6-6" />
  </IconBase>
);

const ChevronLeft = (props: IconProps) => (
  <IconBase {...props}>
    <path d="m15 18-6-6 6-6" />
  </IconBase>
);

const Check = (props: IconProps) => (
  <IconBase {...props}>
    <path d="m20 6-11 11-5-5" />
  </IconBase>
);

const Home = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
    <path d="M9 21V12h6v9" />
  </IconBase>
);

const MapPin = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M21 10c0 6-9 11-9 11S3 16 3 10a9 9 0 1 1 18 0Z" />
    <circle cx="12" cy="10" r="3" />
  </IconBase>
);

const Users = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </IconBase>
);

const ImageIcon = (props: IconProps) => (
  <IconBase {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
    <circle cx="8.5" cy="10.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </IconBase>
);

const Loader2 = (props: IconProps) => (
  <IconBase {...props}>
    <path d="M12 2a10 10 0 0 0-4 19.1" />
  </IconBase>
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface EnderecoForm {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface FotoPreview {
  file: File;
  previewUrl: string;
  legenda: string;
}

interface FormData {
  nome: string;
  slug: string;
  descricao: string;
  universidade: string;
  endereco: EnderecoForm;
  genero: "masculino" | "feminino" | "misto" | "";
  vagas_total: number;
  preco_mensal: string;
  aceita_pets: boolean;
  tem_garagem: boolean;
  mobiliada: boolean;
  internet_inclusa: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function formatCurrency(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const number = parseInt(digits, 10) / 100;
  return number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Step Components ──────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Informações", icon: Home },
  { id: 2, label: "Localização", icon: MapPin },
  { id: 3, label: "Detalhes", icon: Users },
  { id: 4, label: "Fotos", icon: ImageIcon },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CadastrarRepublica() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fotos, setFotos] = useState<FotoPreview[]>([]);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [form, setForm] = useState<FormData>({
    nome: "",
    slug: "",
    descricao: "",
    universidade: "",
    endereco: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
    genero: "",
    vagas_total: 1,
    preco_mensal: "",
    aceita_pets: false,
    tem_garagem: false,
    mobiliada: false,
    internet_inclusa: false,
  });

  // ── Field helpers ────────────────────────────────────────────────────────

  const set = (field: keyof FormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setEndereco = (field: keyof EnderecoForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value },
    }));
  };

  const handleNomeChange = (nome: string) => {
    set("nome", nome);
    set("slug", generateSlug(nome));
  };

  const handlePrecoChange = (raw: string) => {
    set("preco_mensal", formatCurrency(raw));
  };

  // ── CEP lookup ──────────────────────────────────────────────────────────

  const buscarCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",
          },
        }));
      }
    } catch {
      // silent
    } finally {
      setBuscandoCep(false);
    }
  };

  // ── Photo handling ───────────────────────────────────────────────────────

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const novos: FotoPreview[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 10 - fotos.length)
      .map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        legenda: "",
      }));
    setFotos((prev) => [...prev, ...novos]);
  }, [fotos.length]);

  const removeFoto = (index: number) => {
    setFotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateLegenda = (index: number, legenda: string) => {
    setFotos((prev) => prev.map((f, i) => (i === index ? { ...f, legenda } : f)));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // ── Validation ───────────────────────────────────────────────────────────

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.nome.trim()) return "Nome da república é obrigatório.";
      if (!form.universidade.trim()) return "Universidade é obrigatória.";
      if (!form.genero) return "Selecione o gênero da república.";
    }
    if (step === 2) {
      if (!form.endereco.cep.trim()) return "CEP é obrigatório.";
      if (!form.endereco.logradouro.trim()) return "Logradouro é obrigatório.";
      if (!form.endereco.numero.trim()) return "Número é obrigatório.";
      if (!form.endereco.cidade.trim()) return "Cidade é obrigatória.";
      if (!form.endereco.estado.trim()) return "Estado é obrigatório.";
    }
    if (step === 3) {
      if (!form.preco_mensal) return "Preço mensal é obrigatório.";
      if (form.vagas_total < 1) return "Mínimo 1 vaga.";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = () => { setError(null); setStep((s) => Math.max(s - 1, 1)); };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      // Parse preço
      const precoNumerico = parseFloat(
        form.preco_mensal.replace(/\./g, "").replace(",", ".")
      );

      // Garantir slug único
      let slugFinal = form.slug || generateSlug(form.nome);
      const { data: existente } = await supabase
        .from("republicas")
        .select("id")
        .eq("slug", slugFinal)
        .maybeSingle();

      if (existente) {
        slugFinal = `${slugFinal}-${Date.now().toString(36)}`;
      }

      // Inserir república
      const { data: republica, error: repError } = await supabase
        .from("republicas")
        .insert({
          lider_id: user.id,
          nome: form.nome.trim(),
          slug: slugFinal,
          descricao: form.descricao.trim() || null,
          universidade: form.universidade.trim(),
          endereco: form.endereco,
          genero: form.genero,
          vagas_total: form.vagas_total,
          vagas_disponiveis: form.vagas_total,
          preco_mensal: precoNumerico,
          aceita_pets: form.aceita_pets,
          tem_garagem: form.tem_garagem,
          mobiliada: form.mobiliada,
          internet_inclusa: form.internet_inclusa,
          status: "ativa",
        })
        .select("id, slug")
        .single();

      if (repError) throw repError;

      // Upload de fotos
      if (fotos.length > 0) {
        const uploads = fotos.map(async (foto, i) => {
          const ext = foto.file.name.split(".").pop();
          const path = `republicas/${republica.id}/${i}-${Date.now()}.${ext}`;

          const { error: upErr } = await supabase.storage
            .from("fotos")
            .upload(path, foto.file, { upsert: false });

          if (upErr) throw upErr;

          const { data: urlData } = supabase.storage.from("fotos").getPublicUrl(path);

          await supabase.from("republica_fotos").insert({
            republica_id: republica.id,
            url: urlData.publicUrl,
            ordem: i,
            legenda: foto.legenda || null,
          });
        });

        await Promise.all(uploads);
      }

      // Atualizar profile para lider
      await supabase
        .from("profiles")
        .update({ tipo: "lider" })
        .eq("id", user.id);

      router.push(`/republica/${republica.slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao cadastrar república.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        * { box-sizing: border-box; }

        body { margin: 0; }

        .font-serif { font-family: 'Instrument Serif', Georgia, serif; }
        .font-sans-dm { font-family: 'DM Sans', sans-serif; }

        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
        }

        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .input-field:focus {
          border-color: #c8a96e;
        }

        .input-field::placeholder { color: rgba(255,255,255,0.3); }

        textarea.input-field { resize: vertical; min-height: 100px; }

        .btn-primary {
          background: #c8a96e;
          color: #0f0f0f;
          border: none;
          border-radius: 10px;
          padding: 14px 28px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s, transform 0.1s;
        }

        .btn-primary:hover { background: #d4b97e; }
        .btn-primary:active { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 14px 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-ghost:hover {
          color: white;
          border-color: rgba(255,255,255,0.3);
        }

        .toggle-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          user-select: none;
        }

        .toggle-chip.active {
          background: rgba(200,169,110,0.15);
          border-color: rgba(200,169,110,0.4);
          color: #c8a96e;
        }

        .genero-btn {
          flex: 1;
          padding: 14px;
          border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
        }

        .genero-btn.active {
          background: rgba(200,169,110,0.15);
          border-color: #c8a96e;
          color: #c8a96e;
        }

        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          transition: all 0.3s;
        }

        .step-dot.active { background: #c8a96e; width: 24px; border-radius: 4px; }
        .step-dot.done { background: rgba(200,169,110,0.5); }

        .photo-drop {
          border: 2px dashed rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .photo-drop:hover, .photo-drop.drag-over {
          border-color: rgba(200,169,110,0.5);
        }

        .error-msg {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 8px;
          padding: 12px 16px;
          color: #fca5a5;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
        }

        .label {
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }

        .slug-preview {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(200,169,110,0.7);
          margin-top: 6px;
        }

        .counter-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          line-height: 1;
        }

        .counter-btn:hover { background: rgba(255,255,255,0.1); }
        .counter-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>

      {/* Header */}
      <header className="glass" style={{ padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p className="label" style={{ margin: 0 }}>Republique!</p>
          <h1 className="font-serif" style={{ margin: 0, fontSize: 20, fontWeight: 400 }}>Cadastrar República</h1>
        </div>

        {/* Step dots */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`step-dot ${step === s.id ? "active" : step > s.id ? "done" : ""}`}
            />
          ))}
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Step label */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            {(() => { const Icon = STEPS[step - 1].icon; return <Icon size={16} color="#c8a96e" />; })()}
            <span style={{ fontSize: 12, color: "#c8a96e", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Etapa {step} de 4 — {STEPS[step - 1].label}
            </span>
          </div>
          <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
            <div style={{ height: 2, background: "#c8a96e", borderRadius: 2, width: `${(step / 4) * 100}%`, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Error */}
        {error && <div className="error-msg" style={{ marginBottom: 24 }}>{error}</div>}

        {/* ── STEP 1: Informações ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label className="label">Nome da república *</label>
              <input
                className="input-field"
                placeholder="Ex: República dos Pinheiros"
                value={form.nome}
                onChange={(e) => handleNomeChange(e.target.value)}
              />
              {form.slug && (
                <p className="slug-preview">republica.com/<strong>{form.slug}</strong></p>
              )}
            </div>

            <div>
              <label className="label">Universidade *</label>
              <input
                className="input-field"
                placeholder="Ex: USP, UNICAMP, UNESP…"
                value={form.universidade}
                onChange={(e) => set("universidade", e.target.value)}
              />
            </div>

            <div>
              <label className="label">Gênero da república *</label>
              <div style={{ display: "flex", gap: 10 }}>
                {(["masculino", "feminino", "misto"] as const).map((g) => (
                  <button
                    key={g}
                    className={`genero-btn ${form.genero === g ? "active" : ""}`}
                    onClick={() => set("genero", g)}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Descrição</label>
              <textarea
                className="input-field"
                placeholder="Conte um pouco sobre a república, a convivência, regras da casa…"
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: Localização ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
              <div>
                <label className="label">CEP *</label>
                <input
                  className="input-field"
                  placeholder="00000-000"
                  value={form.endereco.cep}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                    const fmt = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
                    setEndereco("cep", fmt);
                    if (v.length === 8) buscarCep(v);
                  }}
                />
                {buscandoCep && <p style={{ fontSize: 11, color: "#c8a96e", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>Buscando…</p>}
              </div>
              <div>
                <label className="label">Estado *</label>
                <input className="input-field" placeholder="SP" value={form.endereco.estado} onChange={(e) => setEndereco("estado", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Logradouro *</label>
              <input className="input-field" placeholder="Rua, Avenida…" value={form.endereco.logradouro} onChange={(e) => setEndereco("logradouro", e.target.value)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
              <div>
                <label className="label">Número *</label>
                <input className="input-field" placeholder="123" value={form.endereco.numero} onChange={(e) => setEndereco("numero", e.target.value)} />
              </div>
              <div>
                <label className="label">Complemento</label>
                <input className="input-field" placeholder="Apto, Casa B…" value={form.endereco.complemento} onChange={(e) => setEndereco("complemento", e.target.value)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="label">Bairro</label>
                <input className="input-field" placeholder="Centro" value={form.endereco.bairro} onChange={(e) => setEndereco("bairro", e.target.value)} />
              </div>
              <div>
                <label className="label">Cidade *</label>
                <input className="input-field" placeholder="São Paulo" value={form.endereco.cidade} onChange={(e) => setEndereco("cidade", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Detalhes ── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label className="label">Preço mensal (R$) *</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>R$</span>
                  <input
                    className="input-field"
                    style={{ paddingLeft: 36 }}
                    placeholder="0,00"
                    value={form.preco_mensal}
                    onChange={(e) => handlePrecoChange(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label">Vagas disponíveis *</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button className="counter-btn" disabled={form.vagas_total <= 1} onClick={() => set("vagas_total", form.vagas_total - 1)}>−</button>
                  <span style={{ fontSize: 20, fontWeight: 500, minWidth: 32, textAlign: "center", fontFamily: "'Instrument Serif', serif" }}>{form.vagas_total}</span>
                  <button className="counter-btn" onClick={() => set("vagas_total", form.vagas_total + 1)}>+</button>
                </div>
              </div>
            </div>

            <div>
              <label className="label" style={{ marginBottom: 12 }}>Comodidades</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {(
                  [
                    { key: "aceita_pets", label: "🐾 Aceita pets" },
                    { key: "tem_garagem", label: "🚗 Tem garagem" },
                    { key: "mobiliada", label: "🛋️ Mobiliada" },
                    { key: "internet_inclusa", label: "📶 Internet inclusa" },
                  ] as { key: keyof FormData; label: string }[]
                ).map(({ key, label }) => (
                  <div
                    key={key}
                    className={`toggle-chip ${form[key] ? "active" : ""}`}
                    onClick={() => set(key, !form[key])}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 5,
                      border: `2px solid ${form[key] ? "#c8a96e" : "rgba(255,255,255,0.2)"}`,
                      background: form[key] ? "#c8a96e" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.15s"
                    }}>
                      {form[key] && <Check size={11} color="#0f0f0f" strokeWidth={3} />}
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Fotos ── */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              className="photo-drop"
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} color="rgba(255,255,255,0.25)" style={{ marginBottom: 12 }} />
              <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
                Arraste fotos ou <span style={{ color: "#c8a96e" }}>clique para selecionar</span>
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>
                JPG, PNG ou WebP · máx 10 fotos
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFiles(e.target.files)}
            />

            {fotos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {fotos.map((foto, i) => (
                  <div key={i} style={{ borderRadius: 12, overflow: "hidden", position: "relative", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <img
                      src={foto.previewUrl}
                      alt=""
                      style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                    />
                    <button
                      onClick={() => removeFoto(i)}
                      style={{
                        position: "absolute", top: 8, right: 8,
                        width: 28, height: 28, borderRadius: "50%",
                        background: "rgba(0,0,0,0.7)", border: "none",
                        color: "white", cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center"
                      }}
                    >
                      <X size={14} />
                    </button>
                    {i === 0 && (
                      <span style={{
                        position: "absolute", top: 8, left: 8,
                        background: "#c8a96e", color: "#0f0f0f",
                        fontSize: 10, fontWeight: 600, padding: "2px 8px",
                        borderRadius: 4, fontFamily: "'DM Sans', sans-serif",
                        letterSpacing: "0.04em"
                      }}>CAPA</span>
                    )}
                    <div style={{ padding: "8px 10px" }}>
                      <input
                        className="input-field"
                        style={{ padding: "8px 10px", fontSize: 12 }}
                        placeholder="Legenda (opcional)"
                        value={foto.legenda}
                        onChange={(e) => updateLegenda(i, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                ))}

                {fotos.length < 10 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      height: 140, border: "2px dashed rgba(255,255,255,0.08)",
                      borderRadius: 12, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", cursor: "pointer",
                      color: "rgba(255,255,255,0.25)", gap: 8, transition: "border-color 0.2s"
                    }}
                  >
                    <Plus size={24} />
                    <span style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>Adicionar</span>
                  </div>
                )}
              </div>
            )}

            {/* Resumo final */}
            <div className="glass" style={{ borderRadius: 14, padding: 20, marginTop: 8 }}>
              <p className="label" style={{ marginBottom: 12 }}>Resumo</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}>
                <span><strong style={{ color: "white" }}>{form.nome}</strong> · {form.genero}</span>
                <span>{form.endereco.cidade}, {form.endereco.estado}</span>
                <span>R$ {form.preco_mensal}/mês · {form.vagas_total} vaga{form.vagas_total > 1 ? "s" : ""}</span>
                <span>{form.universidade}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, gap: 12 }}>
          {step > 1 ? (
            <button className="btn-ghost" onClick={prevStep}>
              <ChevronLeft size={16} /> Voltar
            </button>
          ) : <div />}

          {step < 4 ? (
            <button className="btn-primary" onClick={nextStep}>
              Continuar <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Cadastrando…</>
              ) : (
                <><Check size={16} /> Cadastrar República</>
              )}
            </button>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}