export function PremiumBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [transform:translateZ(0)] [will-change:transform]"
    >
      {/* transform/will-change forces Safari to promote this fixed layer to
          its own GPU compositing layer, preventing it from repainting (and
          briefly flickering/whiting-out) every time the page scrolls. */}
      <div className="absolute inset-0 bg-[#030303]" />
      {/* Fine grain over the black base — reads as brushed metal / textured
          paper instead of a flat, cheap-looking solid fill. */}
      <div className="absolute inset-0 noise-texture opacity-[0.22] mix-blend-screen" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 60% at 50% -25%, rgba(212, 212, 216, 0.14), transparent 55%),
            radial-gradient(ellipse 50% 40% at 0% 40%, rgba(161, 161, 170, 0.07), transparent 50%),
            radial-gradient(ellipse 45% 35% at 100% 60%, rgba(205, 127, 50, 0.05), transparent 45%)
          `,
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-zinc-400/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#030303] to-transparent" />
    </div>
  );
}
