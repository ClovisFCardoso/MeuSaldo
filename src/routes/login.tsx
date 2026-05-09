import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Wallet, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — MeuSaldo" },
      { name: "description", content: "Acesse sua conta MeuSaldo." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) toast.error(error);
      else toast.success("Bem-vindo de volta");
    } else {
      if (!fullName.trim()) { toast.error("Informe seu nome"); setBusy(false); return; }
      const { error } = await signUp(email, password, fullName.trim());
      if (error) toast.error(error);
      else toast.success("Conta criada!");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <div className="size-9 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground">
            <Wallet className="size-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">MeuSaldo</span>
        </div>

        <h1 className="text-lg font-semibold">{mode === "login" ? "Entrar na sua conta" : "Criar uma conta"}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "login" ? "Acesse sua dashboard financeira." : "Comece a controlar seus gastos hoje."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" autoFocus />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required autoFocus={mode === "login"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>

          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin mr-2" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>Não tem conta?{" "}
              <button type="button" onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">Cadastre-se</button>
            </>
          ) : (
            <>Já tem conta?{" "}
              <button type="button" onClick={() => setMode("login")} className="text-primary hover:underline font-medium">Entrar</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
