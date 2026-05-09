import { type ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title = "Nada por aqui ainda",
  description = "Quando houver dados, aparecerão aqui.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl border border-dashed border-border bg-card/50">
      <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Inbox className="size-5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
