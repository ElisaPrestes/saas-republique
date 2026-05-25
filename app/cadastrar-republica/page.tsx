import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import CadastrarRepublicaForm from "@/components/republicas/CadastrarRepublicaForm";

export default async function CadastrarRepublicaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/cadastrar-republica");
  }

  return <CadastrarRepublicaForm />;
}