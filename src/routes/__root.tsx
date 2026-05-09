import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
  useRouterState,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/app/Sidebar";
import { FinanceProvider } from "@/lib/finance-store";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">A página não existe ou foi movida.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Erro ao carregar a página</h1>
        <p className="mt-2 text-sm text-muted-foreground">Algo deu errado. Tente novamente.</p>
        <div className="mt-6">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MeuSaldo — Controle financeiro inteligente" },
      { name: "description", content: "Visualize, registre e entenda suas finanças com clareza." },
      { property: "og:title", content: "MeuSaldo — Controle financeiro inteligente" },
      { name: "twitter:title", content: "MeuSaldo — Controle financeiro inteligente" },
      { property: "og:description", content: "Visualize, registre e entenda suas finanças com clareza." },
      { name: "twitter:description", content: "Visualize, registre e entenda suas finanças com clareza." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/65e850d9-18d5-40e9-aa0b-746518f96b59/id-preview-317fd5f9--8e50d2a7-2586-4755-9b93-e4876724d6f1.lovable.app-1778202632901.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/65e850d9-18d5-40e9-aa0b-746518f96b59/id-preview-317fd5f9--8e50d2a7-2586-4755-9b93-e4876724d6f1.lovable.app-1778202632901.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function PageTitle() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const map: Record<string, string> = {
    "/": "Dashboard",
    "/registros": "Meus Registros",
    "/perfil": "Meu Perfil",
  };
  return (
    <div className="text-sm text-muted-foreground">
      <span>MeuSaldo</span>
      <span className="mx-2 opacity-40">/</span>
      <span className="text-foreground">{map[path] ?? "Página"}</span>
    </div>
  );
}

function AppShell() {
  const { user, loading } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isLogin = path === "/login";

  useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) navigate({ to: "/login" });
  }, [user, loading, isLogin, navigate]);

  if (isLogin) return <Outlet />;

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Carregando...
      </div>
    );
  }

  return (
    <FinanceProvider>
      <div className="min-h-screen flex bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-4 lg:px-8">
            <div className="lg:hidden w-12" />
            <PageTitle />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </FinanceProvider>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={150}>
        <AuthProvider>
          <AppShell />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
