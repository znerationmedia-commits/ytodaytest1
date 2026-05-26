interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  color?: "indigo" | "red" | "amber" | "green" | "gray";
}

const colorClasses = {
  indigo: "text-indigo-600 bg-indigo-50",
  red: "text-red-600 bg-red-50",
  amber: "text-amber-600 bg-amber-50",
  green: "text-green-600 bg-green-50",
  gray: "text-gray-600 bg-gray-50",
};

export function StatCard({ label, value, sub, color = "indigo" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colorClasses[color].split(" ")[0]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
