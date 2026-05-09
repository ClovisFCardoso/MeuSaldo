import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export function InsightCard({ icon: Icon, title, description, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
