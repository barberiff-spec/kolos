export function PremiumBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [transform:translateZ(0)] [will-change:transform]"
    >
      {/* transform/will-change forces Safari to promote this fixed layer to
          its own GPU compositing layer, preventing it from repainting (and
          briefly flickering/whiting-out) every time the page scrolls. */}
      <div className="absolute inset-0 bg-bg" />
      {/* Fine grain over the light gray base — mix-blend-multiply so it reads
          as subtle texture (darkening) rather than washing out on a light fill. */}
      <div className="absolute inset-0 noise-texture opacity-[0.15] mix-blend-multiply" />
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgb(var(--text) / 0.05), transparent 55%)`,
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
