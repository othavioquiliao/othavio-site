// Profile README hero — voxel wordmark. "OTHAVIO" built from extruded One Dark
// green cubes (#98c379 family) on a transparent background, with a cast shadow,
// loose cubes drifting at the edges and a sheen sweeping the letter faces. All
// motion is looping SMIL and frame 0 is the complete wordmark: GitHub renders
// README SVGs via <img>, where one-shot CSS entrance animations freeze on their
// first frame — the previous wordmark shipped invisible because it rose from
// opacity 0. Consumed by othavi0/README (img width=100%).

export const runtime = "edge"

const W = 1200
const H = 200
const P = 20 // cell pitch
const D = 17 // cube extrusion depth
const S = P - 2 // cube face size
const WORD = "OTHAVIO"
// steel blue: base #5c7e9e com variações -10%/+12%/-18% (decisão 2026-08-07, "aço")
const SHADES = ["#5c7e9e", "#52718e", "#6f8da9", "#5c7e9e", "#4b6781", "#5c7e9e"]

const GLYPHS: Record<string, string[]> = {
  O: [".####.", "######", "##..##", "##..##", "##..##", "##..##", "######", ".####."],
  T: ["######", "######", "..##..", "..##..", "..##..", "..##..", "..##..", "..##.."],
  H: ["##..##", "##..##", "##..##", "######", "######", "##..##", "##..##", "##..##"],
  A: [".####.", "######", "##..##", "##..##", "######", "######", "##..##", "##..##"],
  V: ["##..##", "##..##", "##..##", "##..##", ".####.", ".####.", "..##..", "..##.."],
  I: ["######", "######", "..##..", "..##..", "..##..", "..##..", "######", "######"],
}

const COLS = WORD.length * 7 - 1 // 6 glyph columns + 1 gap per letter
const X0 = Math.floor((W - COLS * P) / 2)
const Y0 = Math.floor((H - 8 * P) / 2)

function lighten(hex: string, f: number): string {
  const adj = (c: number) =>
    f >= 0 ? Math.min(255, Math.round(c + (255 - c) * f)) : Math.max(0, Math.round(c * (1 + f)))
  return `#${[1, 3, 5]
    .map((i) => adj(parseInt(hex.slice(i, i + 2), 16)).toString(16).padStart(2, "0"))
    .join("")}`
}

function cells(): { x: number; y: number; shade: string }[] {
  const out: { x: number; y: number; shade: string }[] = []
  let col0 = 0
  for (const ch of WORD) {
    GLYPHS[ch].forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== "#") continue
        const gc = col0 + c
        out.push({ x: X0 + gc * P, y: Y0 + r * P, shade: SHADES[(gc * 31 + r * 17) % SHADES.length] })
      }
    })
    col0 += 7
  }
  // painter's order: bottom rows first, left to right, so upper and right
  // neighbours overlay extrusions correctly
  return out.sort((a, b) => b.y - a.y || a.x - b.x)
}

function cube(x: number, y: number, s: number, d: number, shade: string): string {
  const top = lighten(shade, 0.35)
  const side = lighten(shade, -0.4)
  return (
    `<polygon points="${x},${y} ${x + s},${y} ${x + s + d},${y - d} ${x + d},${y - d}" fill="${top}"/>` +
    `<polygon points="${x + s},${y} ${x + s + d},${y - d} ${x + s + d},${y + s - d} ${x + s},${y + s}" fill="${side}"/>` +
    `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${shade}"/>`
  )
}

function floater(x: number, y: number, s: number, d: number, shade: string, dy: number, dur: number, begin: number): string {
  return (
    `<g transform="translate(0 0)">${cube(x, y, s, d, shade)}` +
    `<animateTransform attributeName="transform" type="translate" values="0 0; 0 ${dy}; 0 0" ` +
    `dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" ` +
    `keySplines=".45 0 .55 1;.45 0 .55 1"/></g>`
  )
}

export function GET() {
  const shadow: string[] = []
  const wall: string[] = []
  const clip: string[] = []
  for (const { x, y, shade } of cells()) {
    shadow.push(`<rect x="${x - 9}" y="${y + 11}" width="${S}" height="${S}"/>`)
    wall.push(cube(x, y, S, D, shade))
    clip.push(`<rect x="${x}" y="${y}" width="${S}" height="${S}"/>`)
  }

  const floaters =
    floater(64, 66, 16, 9, SHADES[0], -9, 4.6, 0) +
    floater(112, 130, 11, 7, SHADES[4], -7, 5.8, 1.2) +
    floater(1092, 58, 13, 8, SHADES[2], -8, 5.2, 0.6) +
    floater(1136, 118, 18, 10, SHADES[0], -10, 6.4, 2) +
    floater(600, 26, 9, 6, SHADES[1], -6, 5, 1.6)

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="OTHAVIO">` +
    `<defs><clipPath id="faces">${clip.join("")}</clipPath>` +
    `<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>` +
    `<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0" stop-color="#fff" stop-opacity="0"/>` +
    `<stop offset=".5" stop-color="#fff" stop-opacity=".14"/>` +
    `<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>` +
    `<g filter="url(#soft)" fill="#000" opacity=".25">${shadow.join("")}</g>` +
    wall.join("") +
    floaters +
    `<g clip-path="url(#faces)"><rect x="-480" y="-40" width="320" height="${H + 80}" fill="url(#sheen)" transform="skewX(-18)">` +
    `<animateTransform attributeName="transform" type="translate" additive="sum" from="0 0" to="1980 0" dur="6s" begin="1s" repeatCount="indefinite"/>` +
    `</rect></g></svg>`

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
