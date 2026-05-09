import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useFinance, CATEGORIES, type Category } from "@/lib/finance-store";
import { PageHeader } from "@/components/app/PageHeader";
import { KpiCard } from "@/components/app/KpiCard";
import { ChartCard } from "@/components/app/ChartCard";
import { InsightCard } from "@/components/app/InsightCard";
import { brl } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, Wallet, Tags, Sparkles, TrendingUp, AlertTriangle, PiggyBank } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MeuSaldo" },
      { name: "description", content: "Visão rápida da sua saúde financeira." },
    ],
  }),
  component: DashboardPage,
});

type Period = "7" | "30" | "all";

function DashboardPage() {
  const { transactions, loading } = useFinance();
  const [period, setPeriod] = useState<Period>("30");
  const [category, setCategory] = useState<Category | "all">("all");

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoff = period === "all" ? 0 : now - parseInt(period) * 86400000;
    return transactions.filter((t) => {
      const ts = new Date(t.date).getTime();
      if (ts < cutoff) return false;
      if (category !== "all" && t.category !== category) return false;
      return true;
    });
  }, [transactions, period, category]);

  const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const days = period === "all" ? Math.max(1, new Set(filtered.map(t => t.date.slice(0,10))).size) : parseInt(period);
  const avgDaily = expense / Math.max(1, days);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    filtered.filter(t => t.type === "expense").forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const topCat = byCategory[0];

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    filtered.filter(t => t.type === "expense").forEach((t) => {
      const k = t.date.slice(0, 10);
      map.set(k, (map.get(k) ?? 0) + t.amount);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        value: Math.round(value * 100) / 100,
      }));
  }, [filtered]);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Sua saúde financeira em um relance.">
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="all">Total</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => setCategory(v as Category | "all")}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[136px] rounded-2xl" />)
        ) : (
          <>
            <KpiCard label="Total de entradas" value={brl(income)} delta={12.4} icon={ArrowUpRight} tone="success" hint="vs período anterior" index={0} />
            <KpiCard label="Total de saídas" value={brl(expense)} delta={-4.8} icon={ArrowDownRight} tone="danger" hint="vs período anterior" index={1} />
            <KpiCard label="Gasto médio diário" value={brl(avgDaily)} delta={2.1} icon={Wallet} hint={`${days} dias`} index={2} />
            <KpiCard label="Maior categoria" value={topCat ? topCat.name : "—"} icon={Tags} hint={topCat ? brl(topCat.value) : "Sem dados"} index={3} />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-6">
        <ChartCard title="Gastos por dia" description="Evolução das despesas no período">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : byDay.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Sem dados no período</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byDay} margin={{ top: 6, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.78 0.14 78)" />
                    <stop offset="100%" stopColor="oklch(0.74 0.14 155)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                <XAxis dataKey="date" tick={{ fill: "oklch(0.68 0.015 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.68 0.015 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.205 0.014 260)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 12, color: "white" }}
                  formatter={(v: number) => brl(v)}
                />
                <Line type="monotone" dataKey="value" stroke="url(#lineGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Despesas por categoria" description="Distribuição no período selecionado">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : byCategory.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Sem despesas no período</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} margin={{ top: 6, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
                <XAxis dataKey="name" tick={{ fill: "oklch(0.68 0.015 260)", fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-15} dy={8} height={50} />
                <YAxis tick={{ fill: "oklch(0.68 0.015 260)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "oklch(1 0 0 / 4%)" }}
                  contentStyle={{ background: "oklch(0.205 0.014 260)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 12, color: "white" }}
                  formatter={(v: number) => brl(v)}
                />
                <Bar dataKey="value" fill="oklch(0.78 0.14 78)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Insights */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">Insights financeiros</h2>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <InsightCard
            icon={TrendingUp}
            title="Gastos com alimentação subiram"
            description="Você gastou 18% mais com Alimentação em comparação ao período anterior."
            index={0}
          />
          <InsightCard
            icon={AlertTriangle}
            title="Lazer em alta nos últimos 7 dias"
            description="Despesas com lazer cresceram nos últimos dias. Considere revisar o orçamento."
            index={1}
          />
          <InsightCard
            icon={PiggyBank}
            title={income > expense ? "Saldo positivo no período" : "Atenção ao saldo"}
            description={income > expense
              ? `Você teve ${brl(income - expense)} a mais em entradas do que saídas.`
              : `Suas saídas superaram as entradas em ${brl(expense - income)}.`}
            index={2}
          />
        </div>
      </div>

      <div className="mt-8">
        <Button variant="outline" onClick={() => { setPeriod("30"); setCategory("all"); }}>
          Limpar filtros
        </Button>
      </div>
    </>
  );
}
