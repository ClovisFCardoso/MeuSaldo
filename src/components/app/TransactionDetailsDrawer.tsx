import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { brl, fullDate } from "@/lib/format";
import { type Transaction } from "@/lib/finance-types";
import { ArrowDownRight, ArrowUpRight, Calendar, Tag, FileText, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TransactionDetailsDrawer({
  tx,
  onOpenChange,
}: {
  tx: Transaction | null;
  onOpenChange: (o: boolean) => void;
}) {
  const isIncome = tx?.type === "income";
  return (
    <Drawer open={!!tx} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="ml-auto h-full w-full max-w-md rounded-none border-l">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            {isIncome ? (
              <span className="size-8 rounded-lg bg-success/15 text-success flex items-center justify-center"><ArrowUpRight className="size-4" /></span>
            ) : (
              <span className="size-8 rounded-lg bg-danger/15 text-danger flex items-center justify-center"><ArrowDownRight className="size-4" /></span>
            )}
            {tx?.description}
          </DrawerTitle>
          <DrawerDescription>Detalhes da movimentação</DrawerDescription>
        </DrawerHeader>

        {tx && (
          <div className="px-6 pb-6 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Valor</div>
              <div className={`mt-1 text-3xl font-semibold ${isIncome ? "text-success" : "text-danger"}`}>
                {isIncome ? "+" : "-"} {brl(tx.amount)}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <Row icon={Tag} label="Categoria" value={<Badge variant="secondary">{tx.category}</Badge>} />
              <Row icon={Calendar} label="Data" value={fullDate(tx.date)} />
              <Row icon={Clock} label="Tipo" value={isIncome ? "Entrada" : "Saída"} />
              {tx.note && <Row icon={FileText} label="Observação" value={tx.note} />}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h4 className="text-sm font-semibold mb-3">Linha do tempo</h4>
              <ol className="relative border-l border-border pl-4 space-y-3">
                <li>
                  <div className="absolute -left-1.5 size-3 rounded-full bg-primary" />
                  <p className="text-xs text-muted-foreground">{fullDate(tx.date)}</p>
                  <p className="text-sm">Movimentação registrada</p>
                </li>
                <li>
                  <div className="absolute -left-1.5 size-3 rounded-full bg-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">Hoje</p>
                  <p className="text-sm text-muted-foreground">Visualização do registro</p>
                </li>
              </ol>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span>{label}</span>
      </div>
      <div className="text-foreground text-right">{value}</div>
    </div>
  );
}
