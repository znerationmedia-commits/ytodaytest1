interface PaxGaugeProps {
  actual: number;
  required: number;
  size?: number;
}

export function PaxGauge({ actual, required, size = 110 }: PaxGaugeProps) {
  const percent = required > 0 ? (actual / required) * 100 : 0;
  const display = Math.round(percent);
  const radius = (size - 12) / 2;
  const circ = 2 * Math.PI * radius;
  // Cap the arc visualization at 100%, but show the real number in the middle (can exceed)
  const arcPct = Math.min(percent, 100);
  const offset = circ - (arcPct / 100) * circ;

  // Color stages: under-target (amber), at-target (green), over-target (indigo)
  const color =
    percent >= 100 && actual > required
      ? "#4f46e5" // indigo (over)
      : percent >= 100
      ? "#10b981" // green (exact)
      : percent >= 70
      ? "#f59e0b" // amber
      : "#ef4444"; // red

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl font-bold text-gray-900">{display}%</div>
          <div className="text-[10px] text-gray-500 font-medium">
            {actual} / {required || "?"}
          </div>
        </div>
      </div>
    </div>
  );
}
