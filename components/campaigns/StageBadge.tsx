import { Badge } from "@/components/ui/Badge";
import { STAGE_COLORS, STAGE_DOT_COLORS } from "@/lib/constants";
import type { StageValue } from "@/lib/types";

export function StageBadge({ stage }: { stage: StageValue | string }) {
  if (!stage) return <span className="text-gray-400 text-xs">—</span>;
  const colorClass = STAGE_COLORS[stage] ?? "bg-gray-100 text-gray-700";
  const dotClass = STAGE_DOT_COLORS[stage] ?? "bg-gray-400";
  return (
    <Badge className={colorClass}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {stage}
    </Badge>
  );
}
