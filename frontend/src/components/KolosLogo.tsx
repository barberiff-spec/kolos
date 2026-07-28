interface KolosLogoProps {
  size?: number;
  className?: string;
  /** Draw the mark stroke-by-stroke instead of rendering it fully formed. Used on the splash screen. */
  animate?: boolean;
}

// Stem → top leaf → outer arcs → grain pairs, bottom pair first (sprouting upward).
// One entry per <path> below, in DOM order.
const DRAW_DELAYS = [0, 0.45, 0.3, 0.3, 0.6, 0.6, 0.75, 0.75, 0.9, 0.9];
const DRAW_DURATION = 0.5;

const PATHS = [
  "M60 18 V186", // стебель
  "M60 40 C75 60 75 80 60 98 C45 80 45 60 60 40 Z", // верхний лист-веретено
  "M32 66 V120 C32 152 44 168 60 172", // внешняя дуга — левая
  "M88 66 V120 C88 152 76 168 60 172", // внешняя дуга — правая
  "M60 172 C46 172 34 160 33 140", // нижняя пара зёрен — левое
  "M60 172 C74 172 86 160 87 140", // нижняя пара зёрен — правое
  "M60 142 C46 142 34 130 33 110", // средняя пара зёрен — левое
  "M60 142 C74 142 86 130 87 110", // средняя пара зёрен — правое
  "M60 112 C46 112 34 100 33 80", // верхняя пара зёрен — левое
  "M60 112 C74 112 86 100 87 80", // верхняя пара зёрен — правое
];

export function KolosLogo({ size = 120, className = "", animate = false }: KolosLogoProps) {
  return (
    <svg
      width={size}
      height={(size * 200) / 120}
      viewBox="0 0 120 200"
      fill="none"
      stroke="currentColor"
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Kolos"
    >
      {PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          {...(animate
            ? {
                pathLength: 1,
                strokeDasharray: 1,
                strokeDashoffset: 1,
                className: "kolos-draw",
                style: {
                  animationDelay: `${DRAW_DELAYS[i]}s`,
                  animationDuration: `${DRAW_DURATION}s`,
                },
              }
            : {})}
        />
      ))}
    </svg>
  );
}
