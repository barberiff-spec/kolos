import { writeFile } from "node:fs/promises";
import { ImageResponse } from "../node_modules/next/dist/compiled/@vercel/og/index.node.js";

const BG = "#0F1219";
const ACCENT = "#12A89D";
const NATIVE_STROKE = 7; // svg units, matches KolosLogo.tsx at viewBox 120x200
const MIN_RENDERED_PX = 2; // floor so thin strokes stay legible at small sizes

// Native stroke stays proportional (7 units) until that would render under
// MIN_RENDERED_PX, then thickens (in svg-unit space) to hold the pixel floor.
function strokeWidthFor(innerW) {
  const proportionalPx = (innerW * NATIVE_STROKE) / 120;
  if (proportionalPx >= MIN_RENDERED_PX) return NATIVE_STROKE;
  return (MIN_RENDERED_PX * 120) / innerW;
}

// Same contour paths as components/KolosLogo.tsx, native viewBox 120x200.
function kolosPaths(strokeWidth) {
  const props = {
    fill: "none",
    stroke: ACCENT,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  return [
    "M60 18 V186",
    "M60 40 C75 60 75 80 60 98 C45 80 45 60 60 40 Z",
    "M32 66 V120 C32 152 44 168 60 172",
    "M88 66 V120 C88 152 76 168 60 172",
    "M60 112 C46 112 34 100 33 80",
    "M60 112 C74 112 86 100 87 80",
    "M60 142 C46 142 34 130 33 110",
    "M60 142 C74 142 86 130 87 110",
    "M60 172 C46 172 34 160 33 140",
    "M60 172 C74 172 86 160 87 140",
  ].map((d, i) => ({ d, props, key: i }));
}

// Rounded-square app icon: bg fill, logo scaled to fit with ~18% padding on each side.
async function renderAppIcon(size) {
  const pad = Math.round(size * 0.18);
  const innerW = size - pad * 2;
  // Logo aspect ratio is 120:200 (0.6); fit height to inner box, derive width.
  const logoH = innerW * (200 / 120) > size - pad * 2 * (200 / 120) ? innerW : innerW;
  const scale = innerW / 120;
  const strokeWidth = strokeWidthFor(innerW);

  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          borderRadius: size * 0.22,
        },
        children: {
          type: "svg",
          props: {
            width: innerW,
            height: innerW * (200 / 120),
            viewBox: "0 0 120 200",
            children: kolosPaths(strokeWidth).map((p) => ({
              type: "path",
              props: { d: p.d, ...p.props },
              key: p.key,
            })),
          },
        },
      },
    },
    { width: size, height: size }
  );
}

// Maskable icon: extra safe-area padding (~26%) so platform masks don't clip the mark.
async function renderMaskableIcon(size) {
  const pad = Math.round(size * 0.26);
  const innerW = size - pad * 2;
  const scale = innerW / 120;
  const strokeWidth = strokeWidthFor(innerW);

  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
        },
        children: {
          type: "svg",
          props: {
            width: innerW,
            height: innerW * (200 / 120),
            viewBox: "0 0 120 200",
            children: kolosPaths(strokeWidth).map((p) => ({
              type: "path",
              props: { d: p.d, ...p.props },
              key: p.key,
            })),
          },
        },
      },
    },
    { width: size, height: size }
  );
}

// Plain favicon (no rounded-square background needed at tiny sizes, just bg-filled square).
async function renderFavicon(size) {
  const pad = Math.round(size * 0.1);
  const innerW = size - pad * 2;
  const scale = innerW / 120;
  const strokeWidth = strokeWidthFor(innerW);

  return new ImageResponse(
    {
      type: "div",
      props: {
        style: {
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
        },
        children: {
          type: "svg",
          props: {
            width: innerW,
            height: innerW * (200 / 120),
            viewBox: "0 0 120 200",
            children: kolosPaths(strokeWidth).map((p) => ({
              type: "path",
              props: { d: p.d, ...p.props },
              key: p.key,
            })),
          },
        },
      },
    },
    { width: size, height: size }
  );
}

async function save(res, path) {
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(path, buf);
  console.log("wrote", path, buf.length, "bytes");
}

const PUBLIC = new URL("../public/", import.meta.url);

await save(await renderFavicon(16), new URL("favicon-16.png", PUBLIC));
await save(await renderFavicon(32), new URL("favicon-32.png", PUBLIC));
await save(await renderAppIcon(180), new URL("apple-touch-icon.png", PUBLIC));
await save(await renderAppIcon(192), new URL("icon-192.png", PUBLIC));
await save(await renderAppIcon(512), new URL("icon-512.png", PUBLIC));
await save(await renderMaskableIcon(512), new URL("maskable-icon-512.png", PUBLIC));

console.log("done");
