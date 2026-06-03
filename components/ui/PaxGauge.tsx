interface PaxGaugeProps {
  actual: number;
  required: number;
  size?: number;
}

export function PaxGauge({ actual, required, size = 110 }: PaxGaugeProps) {
  const percent = required > 0 ? (actual / required) * 100 : 0;
  const display = Math.round(percent);
  const strokeWidth = size <= 50 ? 6 : 10;
  const radius = (size - strokeWidth - 2) / 2;
  const circ = 2 * Math.PI * radius;
  const arcPct = Math.min(percent, 100);
  const offset = circ - (arcPct / 100) * circ;

  const color =
    percent >= 100 && actual > required
      ? "#4f46e5" // indigo (over)
      : percent >= 100
      ? "#10b981" // green (exact / met)
      : percent >= 70
      ? "#f59e0b" // amber
      : "#ef4444"; // red

  const showSubtitle = size >= 70;
  const numberSize = size <= 50 ? "text-[10px]" : size <= 70 ? "text-xs" : "text-xl";

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <div className={`${numberSize} font-bold text-gray-900`}>{display}%</div>
          {showSubtitle && (
            <div className="text-[10px] text-gray-500 font-medium mt-0.5">
              {actual} / {required || "?"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
