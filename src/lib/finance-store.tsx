import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CATEGORIES, type Category, type Transaction, type TxType } from "./finance-types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

interface DbRow {
  id: string;
  user_id: string;
  type: TxType;
  category: string;
  description: string;
  amount: number | string;
  notes: string | null;
  transaction_date: string;
}

function rowToTx(r: DbRow): Transaction {
  return {
    id: r.id,
    description: r.description,
    category: r.category as Category,
    type: r.type,
    amount: typeof r.amount === "string" ? parseFloat(r.amount) : r.amount,
    date: r.transaction_date,
    note: r.notes ?? undefined,
  };
}

interface StoreCtx {
  transactions: Transaction[];
  loading: boolean;
  add: (t: Omit<Transaction, "id">) => Promise<void>;
  update: (id: string, t: Omit<Transaction, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const Ctx = createContext<StoreCtx | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("financial_records")
      .select("*")
      .order("transaction_date", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar registros");
      setTransactions([]);
    } else {
      setTransactions((data as DbRow[]).map(rowToTx));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const add: StoreCtx["add"] = async (t) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("financial_records")
      .insert({
        user_id: user.id,
        type: t.type,
        category: t.category,
        description: t.description,
        amount: t.amount,
        notes: t.note ?? null,
        transaction_date: t.date,
      })
      .select()
      .single();
    if (error) { toast.error("Erro ao salvar"); throw error; }
    setTransactions((p) => [rowToTx(data as DbRow), ...p]);
  };

  const update: StoreCtx["update"] = async (id, t) => {
    const { data, error } = await supabase
      .from("financial_records")
      .update({
        type: t.type,
        category: t.category,
        description: t.description,
        amount: t.amount,
        notes: t.note ?? null,
        transaction_date: t.date,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) { toast.error("Erro ao atualizar"); throw error; }
    setTransactions((p) => p.map((x) => (x.id === id ? rowToTx(data as DbRow) : x)));
  };

  const remove: StoreCtx["remove"] = async (id) => {
    const { error } = await supabase.from("financial_records").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); throw error; }
    setTransactions((p) => p.filter((x) => x.id !== id));
  };

  const value = useMemo(() => ({ transactions, loading, add, update, remove }), [transactions, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFinance() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFinance must be used inside FinanceProvider");
  return v;
}

export { CATEGORIES };
export type { Category, TxType, Transaction };
