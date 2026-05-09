import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFinance, CATEGORIES, type Category } from "@/lib/finance-store";
import { type Transaction, type TxType } from "@/lib/finance-types";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, ArrowUpDown, Pencil, Trash2, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { brl, shortDate } from "@/lib/format";
import { TransactionModal } from "@/components/app/TransactionModal";
import { TransactionDetailsDrawer } from "@/components/app/TransactionDetailsDrawer";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/app/EmptyState";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/registros")({
  head: () => ({
    meta: [
      { title: "Meus Registros — MeuSaldo" },
      { name: "description", content: "Gerencie suas entradas e saídas." },
    ],
  }),
  component: RegistrosPage,
});

const PAGE_SIZE = 8;

function RegistrosPage() {
  const { transactions, loading, add, update, remove } = useFinance();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TxType | "all">("all");
  const [cat, setCat] = useState<Category | "all">("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [viewing, setViewing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setEditing(null);
        setModalOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setModalOpen(false);
        setViewing(null);
        setDeleting(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((t) => (type === "all" ? true : t.type === type))
      .filter((t) => (cat === "all" ? true : t.category === cat))
      .filter((t) =>
        q ? t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) : true
      )
      .sort((a, b) => (sortDesc ? +new Date(b.date) - +new Date(a.date) : +new Date(a.date) - +new Date(b.date)));
  }, [transactions, query, type, cat, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);

  return (
    <>
      <PageHeader title="Meus Registros" subtitle="Gerencie todas as suas movimentações financeiras.">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar (Ctrl+F)"
            className="pl-9 w-[220px]"
          />
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus className="size-4" /> Novo Registro
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={type} onValueChange={(v) => setType(v as TxType | "all")}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="income">Entrada</SelectItem>
            <SelectItem value="expense">Saída</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cat} onValueChange={(v) => setCat(v as Category | "all")}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setSortDesc((v) => !v)}>
          <ArrowUpDown className="size-4" /> Data {sortDesc ? "↓" : "↑"}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium text-right">Valor</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><Skeleton className="h-4 w-full max-w-[140px]" /></td>
                    ))}
                  </tr>
                ))
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState
                      title={query ? "Nenhum resultado" : "Sem registros"}
                      description={query ? "Tente ajustar a busca ou os filtros." : "Comece adicionando sua primeira movimentação."}
                      action={!query && (
                        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
                          <Plus className="size-4" /> Novo Registro
                        </Button>
                      )}
                    />
                  </td>
                </tr>
              ) : (
                <AnimatePresence initial={false}>
                  {pageItems.map((t) => (
                    <motion.tr
                      key={t.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border last:border-0 hover:bg-accent/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-lg flex items-center justify-center ${t.type === "income" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
                            {t.type === "income" ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                          </div>
                          <div>
                            <div className="font-medium">{t.description}</div>
                            {t.note && <div className="text-xs text-muted-foreground line-clamp-1">{t.note}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="secondary">{t.category}</Badge></td>
                      <td className="px-4 py-3">
                        {t.type === "income" ? (
                          <span className="inline-flex items-center gap-1.5 text-success text-xs font-medium"><span className="size-1.5 rounded-full bg-success" /> Entrada</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-danger text-xs font-medium"><span className="size-1.5 rounded-full bg-danger" /> Saída</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold tabular-nums ${t.type === "income" ? "text-success" : "text-danger"}`}>
                        {t.type === "income" ? "+" : "-"} {brl(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{shortDate(t.date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setViewing(t)} aria-label="Visualizar">
                            <Eye className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => { setEditing(t); setModalOpen(true); }} aria-label="Editar">
                            <Pencil className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleting(t)} aria-label="Excluir">
                            <Trash2 className="size-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
            <span className="text-muted-foreground">{filtered.length} registros</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
              <span className="text-muted-foreground tabular-nums">Página {page} de {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</Button>
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSubmit={async (data) => {
          if (editing) await update(editing.id, data);
          else await add(data);
        }}
      />

      <TransactionDetailsDrawer tx={viewing} onOpenChange={(o) => !o && setViewing(null)} />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. <span className="text-foreground font-medium">{deleting?.description}</span> — {deleting && brl(deleting.amount)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleting) {
                  await remove(deleting.id);
                  toast.success("Registro excluído");
                  setDeleting(null);
                }
              }}
              className="bg-danger text-danger-foreground hover:bg-danger/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
