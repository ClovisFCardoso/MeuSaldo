import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Calendar, Globe, LogOut, Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — MeuSaldo" },
      { name: "description", content: "Preferências, conta e segurança." },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("BRL");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, currency, created_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!error && data) {
        setFullName(data.full_name ?? "");
        setEmail(data.email ?? user.email ?? "");
        setCurrency(data.currency ?? "BRL");
        setCreatedAt(data.created_at ?? "");
      } else {
        setEmail(user.email ?? "");
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, currency })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Perfil atualizado");
  };

  const initials = (fullName || email || "U")
    .split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : "—";

  return (
    <>
      <PageHeader title="Meu Perfil" subtitle="Gerencie suas informações e preferências." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <Avatar className="size-20 mx-auto ring-2 ring-primary/40">
              <AvatarFallback className="text-lg gradient-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-lg font-semibold">{fullName || "Usuário"}</h2>

            <div className="mt-6 space-y-3 text-left text-sm">
              <Row icon={Mail} label="E-mail" value={email} />
              <Row icon={Calendar} label="Membro desde" value={memberSince} />
            </div>

            <Button
              variant="outline"
              className="w-full mt-6"
              onClick={async () => { await signOut(); toast.success("Sessão encerrada"); }}
            >
              <LogOut className="size-4" /> Sair
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Section title="Informações pessoais" description="Atualize seus dados de conta.">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Carregando...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fname" className="flex items-center gap-2"><UserIcon className="size-4 text-muted-foreground" /> Nome completo</Label>
                  <Input id="fname" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> E-mail</Label>
                  <Input value={email} disabled />
                </div>
              </div>
            )}
          </Section>

          <Section title="Preferências" description="Personalize a experiência do MeuSaldo.">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2"><Globe className="size-4 text-muted-foreground" /> Moeda</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={save} disabled={saving || loading}>
                {saving && <Loader2 className="size-4 animate-spin mr-2" />}
                Salvar alterações
              </Button>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground inline-flex items-center gap-2"><Icon className="size-4" /> {label}</span>
      <span className="text-foreground truncate max-w-[180px]">{value}</span>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
