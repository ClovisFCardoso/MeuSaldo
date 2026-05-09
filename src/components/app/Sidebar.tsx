import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Receipt, User, Wallet, Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/registros", label: "Meus Registros", icon: Receipt },
];

export function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [openMobile, setOpenMobile] = useState(false);

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  const Inner = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <div className="size-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground">
          <Wallet className="size-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">MeuSaldo</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => {
          const active = isActive(it.to, it.exact);
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => setOpenMobile(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <it.icon className={cn("size-4 transition-colors", active && "text-primary")} />
              <span>{it.label}</span>
              {active && (
                <motion.span
                  layoutId="nav-dot"
                  className="ml-auto size-1.5 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/perfil"
          onClick={() => setOpenMobile(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            isActive("/perfil")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          )}
        >
          <User className="size-4" />
          Meu Perfil
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        <Inner />
      </aside>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpenMobile(true)}
        className="lg:hidden fixed top-3 left-3 z-40 size-10 rounded-xl bg-card border border-border flex items-center justify-center"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      <AnimatePresence>
        {openMobile && (
          <motion.div
            className="lg:hidden fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpenMobile(false)} />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute left-0 top-0 h-full w-64"
            >
              <Inner />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
