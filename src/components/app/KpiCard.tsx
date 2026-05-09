import { motion } from "framer-motion";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta?: number; // percent
  icon: LucideIcon;
  tone?: "default" | "success" | "danger";
  hint?: string;
  index?: number;
}

export function KpiCard({ label, value, delta, icon: Icon, tone = "default", hint, index = 0 }: Props) {
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      className="glass-card rounded-2xl border border-border p-5 transition-shadow hover:shadow-xl hover:shadow-black/30"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <div
          className={cn(
            "size-9 rounded-xl flex items-center justify-center",
            tone === "success" && "bg-success/15 text-success",
            tone === "danger" && "bg-danger/15 text-danger",
            tone === "default" && "bg-primary/15 text-primary"
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
              positive ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
            )}
          >
            {positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </motion.div>
  );
}
