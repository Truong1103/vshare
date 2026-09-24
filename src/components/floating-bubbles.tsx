"use client";

const COLORS = ["rgba(15,143,138,0.08)", "rgba(21,101,192,0.07)", "rgba(245,158,11,0.09)", "rgba(15,143,138,0.05)", "rgba(21,101,192,0.05)"];
const SIZES = [8, 10, 12, 14, 16, 20, 24, 32, 40, 52, 18, 28];

const DOTS = Array.from({ length: 42 }, (_, i) => ({
  left: `${(i * 17 + 4) % 96}%`,
  top: `${(i * 23 + 6) % 92}%`,
  size: SIZES[i % SIZES.length],
  color: COLORS[i % COLORS.length],
  delay: `${((i * 0.41) % 6).toFixed(2)}s`,
  duration: `${7 + (i % 9)}s`,
  variant: i % 3,
}));

export function FloatingBubbles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {DOTS.map((d, i) => (
        <span
          key={i}
          className={d.variant === 1 ? "bubble bubble-b" : d.variant === 2 ? "bubble bubble-c" : "bubble"}
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            background: d.color,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
    </div>
  );
}
