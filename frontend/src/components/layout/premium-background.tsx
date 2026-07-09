export function PremiumBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#030303]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 60% at 50% -25%, rgba(205, 127, 50, 0.22), transparent 55%),
            radial-gradient(ellipse 50% 40% at 0% 40%, rgba(184, 115, 51, 0.08), transparent 50%),
            radial-gradient(ellipse 45% 35% at 100% 60%, rgba(205, 127, 50, 0.06), transparent 45%)
          `,
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-copper-500/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#030303] to-transparent" />
    </div>
  );
}
