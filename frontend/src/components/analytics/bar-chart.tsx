interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  formatValue?: (value: number) => string;
}

export function BarChart({ data, height = 180, formatValue }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="relative" style={{ height }}>
      <div className="absolute inset-0 flex flex-col justify-between">
        {gridLines.map((g) => (
          <div key={g} className="border-t border-border/20" />
        ))}
      </div>
      <div className="relative flex h-full items-end gap-3 px-1">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
            <span className="text-xs text-accent font-medium">
              {formatValue ? formatValue(d.value) : d.value}
            </span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-accent-deep to-accent transition-all duration-300"
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 3 : 0)}%` }}
            />
            <span className="text-[11px] text-muted uppercase tracking-wide">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
