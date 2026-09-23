export function BarChart({
  labels,
  values,
  color = "#0f8f8a",
}: {
  labels: string[];
  values: number[];
  color?: string;
}) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex h-44 items-end gap-2">
      {values.map((v, i) => {
        const pct = Math.max(6, (v / max) * 100);
        return (
          <div key={labels[i] || i} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-[11px] font-semibold text-ink">{v}</span>
            <div className="flex h-[120px] w-full items-end justify-center">
              <div className="w-4/5 rounded-t-lg" style={{ height: `${pct}%`, background: color }} />
            </div>
            <span className="truncate text-[10px] text-muted">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DonutChart({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  let acc = 0;
  const stops = items.map((i) => {
    const start = (acc / total) * 100;
    acc += i.value;
    const end = (acc / total) * 100;
    return `${i.color} ${start}% ${end}%`;
  });
  return (
    <div className="flex items-center gap-6">
      <div
        className="h-36 w-36 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(",")})` }}
      >
        <div className="m-[22px] grid h-[100px] w-[100px] place-items-center rounded-full bg-white text-center">
          <div>
            <p className="text-2xl font-extrabold">{items.reduce((s, i) => s + i.value, 0)}</p>
            <p className="text-[10px] text-muted">Tổng</p>
          </div>
        </div>
      </div>
      <div className="grid gap-2 text-sm">
        {items.map((i) => (
          <div key={i.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color }} />
            <span className="text-muted">{i.label}</span>
            <span className="font-semibold">{i.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
