interface KolosLogoProps {
  size?: number;
  className?: string;
}

export function KolosLogo({ size = 120, className = "" }: KolosLogoProps) {
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
      {/* стебель */}
      <path d="M60 18 V186" />
      {/* верхний лист-веретено */}
      <path d="M60 40 C75 60 75 80 60 98 C45 80 45 60 60 40 Z" />
      {/* внешние дуги — бокал */}
      <path d="M32 66 V120 C32 152 44 168 60 172" />
      <path d="M88 66 V120 C88 152 76 168 60 172" />
      {/* три пары изогнутых зёрен */}
      <path d="M60 112 C46 112 34 100 33 80" />
      <path d="M60 112 C74 112 86 100 87 80" />
      <path d="M60 142 C46 142 34 130 33 110" />
      <path d="M60 142 C74 142 86 130 87 110" />
      <path d="M60 172 C46 172 34 160 33 140" />
      <path d="M60 172 C74 172 86 160 87 140" />
    </svg>
  );
}
