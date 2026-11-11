import { Badge } from "@/components/ui/badge";
import { statusTone, priorityTone, type Status, type Priority } from "@/lib/complaints";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

const toneClass = {
  muted: "bg-muted text-muted-foreground border-transparent",
  info: "bg-info/10 text-info border-info/30",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/15 text-warning-foreground border-warning/40",
  destructive: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: Status }) {
  const { tStatus } = useLanguage();
  return (
    <Badge variant="outline" className={cn("font-medium", toneClass[statusTone(status)])}>
      {tStatus(status)}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { tPriority } = useLanguage();
  return (
    <Badge variant="outline" className={cn("font-medium", toneClass[priorityTone(priority)])}>
      {tPriority(priority)}
    </Badge>
  );
}
