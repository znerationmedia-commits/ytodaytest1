import { Badge } from "@/components/ui/Badge";

export function UrgencyBadge({ urgent }: { urgent: string }) {
  if (!urgent) return null;
  const isAsap = urgent.toLowerCase() === "asap";
  if (!isAsap && urgent.toLowerCase() !== "can take time") return null;
  return (
    <Badge className={isAsap ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}>
      {isAsap ? "⚡ ASAP" : urgent}
    </Badge>
  );
}
