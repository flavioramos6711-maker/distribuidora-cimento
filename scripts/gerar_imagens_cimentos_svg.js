/* =============================================================================
 * IMAGENS EXCLUSIVAS DE CIMENTO — SVG conceitual renderizado em PNG puro
 * Apenas módulos nativos: fs, path, zlib. Sem dependências externas.
 * Cada marca tem fundo institucional próprio + saco com costuras + textos.
 * Os arquivos mantêm extensão .jpg (conteúdo PNG válido — Next.js serve ambos).
 * NÃO toca no Supabase (rotas /images/cimentos/... já estão corretas).
 * Uso: node scripts/gerar_imagens_cimentos_svg.js
 * ============================================================================= */
const fs = require("fs")
const path = require("path")
const zlib = require("zlib")

const DIR = path.resolve(process.cwd(), "public/images/cimentos")
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true })

/* ── PNG encoder (crc32/chunk/encodePNG) ── */
function crc32(buf) {
  if (!crc32.t) {
    crc32.t = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crc32.t[n] = c
    }
  }
  let c = -1
  for (let i = 0; i < buf.length; i++) c = crc32.t[(c ^ buf[i]) & 255] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, "ascii"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc(h * (1 + w * 4))
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0
    Buffer.from(rgba.slice(y * w * 4, (y + 1) * w * 4)).copy(raw, y * (1 + w * 4) + 1)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

/* ── Utilidades de cor/desenho ── */
function hex(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
}
// src sobre dst com alpha 0..1
function blend(buf, x, y, W, rgb, a) {
  if (x < 0 || y < 0 || x >= W) return
  const i = (y * W + x) * 4
  buf[i] = Math.round(rgb[0] * a + buf[i] * (1 - a))
  buf[i + 1] = Math.round(rgb[1] * a + buf[i + 1] * (1 - a))
  buf[i + 2] = Math.round(rgb[2] * a + buf[i + 2] * (1 - a))
}
function setPx(buf, x, y, W, H, rgb) {
  if (x < 0 || y < 0 || x >= W || y >= H) return
  const i = (y * W + x) * 4
  buf[i] = rgb[0]; buf[i + 1] = rgb[1]; buf[i + 2] = rgb[2]; buf[i + 3] = 255
}
function inRounded(x, y, x0, y0, x1, y1, r) {
  if (x >= x0 + r && x <= x1 - r) return y >= y0 && y <= y1
  if (y >= y0 + r && y <= y1 - r) return x >= x0 && x <= x1
  const cx = x < x0 + r ? x0 + r : x1 - r
  const cy = y < y0 + r ? y0 + r : y1 - r
  const dx = x - cx, dy = y - cy
  return dx * dx + dy * dy <= r * r
}

/* ── Fonte bitmap 5x7 (maiúsculas, dígitos e símbolos) ── */
const FONT = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "##..#", "#.#.#", "#..##", "#..##", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#.#.#", "#.#.#", ".#.#."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#..##", "#.#.#", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  "/": ["....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."],
  "&": [".##..", "#..#.", "#.#..", ".#...", "#.#.#", "#..#.", ".##.#"],
  "(": ["...#.", "..#..", ".#...", ".#...", ".#...", "..#..", "...#."],
  ")": [".#...", "..#..", "...#.", "...#.", "...#.", "..#..", ".#..."],
  "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
}
function stripAccents(s) {
  return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
}
function textWidth(s, scale) {
  return s.length * 6 * scale - scale
}
function fitScale(s, maxW, maxS) {
  for (let s = maxS; s >= 1; s--) if (textWidth(s, s) <= maxW) return s
  return 1
}
function drawText(buf, W, H, str, cx, top, scale, rgb) {
  const s = stripAccents(str)
  let x = Math.round(cx - textWidth(s, scale) / 2)
  for (const ch of s) {
    const g = FONT[ch] || FONT[" "]
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 5; c++)
        if (g[r][c] === "#")
          for (let dy = 0; dy < scale; dy++)
            for (let dx = 0; dx < scale; dx++)
              setPx(buf, x + c * scale + dx, top + r * scale + dy, W, H, rgb)
    x += 6 * scale
  }
}

/* ── Especificações por arquivo ── */
const SPECS = [
  { file: "votoran-cpii.jpg", brand: "VOTORAN", type: "CP II-E 32", res: "RESISTENCIA 32 MPA", weight: "50 KG", bg: "#003DA5", accent: "#FFD600" },
  { file: "votoran-cpiii.jpg", brand: "VOTORAN", type: "CP III 40", res: "RESISTENCIA 40 MPA", weight: "50 KG", bg: "#003DA5", accent: "#00A651" },
  { file: "votoran-cpvari.jpg", brand: "VOTORAN", type: "CP V-ARI", res: "ALTA RESISTENCIA", weight: "50 KG", bg: "#C8102E", accent: "#FFFFFF" },
  { file: "votoran-cpiv.jpg", brand: "VOTORAN", type: "CP IV 32", res: "RESISTENCIA 32 MPA", weight: "50 KG", bg: "#003DA5", accent: "#9E9E9E" },
  { file: "caue-cpiie.jpg", brand: "CAUE", type: "CP II-E 32", res: "RESISTENCIA 32 MPA", weight: "50 KG", bg: "#C8102E", accent: "#D4AF37" },
  { file: "caue-cpiii.jpg", brand: "CAUE", type: "CP III 40", res: "RESISTENCIA 40 MPA", weight: "50 KG", bg: "#8B0000", accent: null },
  { file: "montes-claros-cpiie.jpg", brand: "MONTES CLAROS", type: "CP II-E 32", res: "RESISTENCIA 32 MPA", weight: "50 KG", bg: "#1565C0", accent: "#FFFFFF" },
  { file: "maua-cpiie.jpg", brand: "MAUA", type: "CP II-E 32", res: "RESISTENCIA 32 MPA", weight: "50 KG", bg: "#B71C1C", accent: "#F5E6C8" },
  { file: "csn-cpiif.jpg", brand: "CSN", type: "CP II-F 32", res: "RESISTENCIA 32 MPA", weight: "50 KG", bg: "#0D47A1", accent: "#C0C0C0" },
  { file: "tupi-cpiie.jpg", brand: "TUPI", type: "CP II-E 32", res: "RESISTENCIA 32 MPA", weight: "50 KG", bg: "#2E7D32", accent: "#FFFFFF" },
  { file: "ciplan-cpiif.jpg", brand: "CIPLAN", type: "CP II-F 32", res: "RESISTENCIA 32 MPA", weight: "50 KG", bg: "#1A237E", accent: "#C62828" },
  { file: "liz-cpiie.jpg", brand: "LIZ", type: "CP II-E 32", res: "RESISTENCIA 32 MPA", weight: "50 KG", bg: "#F57F17", accent: "#1565C0" },
  { file: "cimento-branco.jpg", brand: "CIMENTO BRANCO", type: "CPB 40", res: "RESISTENCIA 40 MPA", weight: "25 KG", bg: "#ECEFF1", band: "#37474F", typeColor: "#37474F", resColor: "#78909C", badgeColor: "#37474F", sackBorder: "#B0BEC5", accent: null },
  { file: "cimento-queimado.jpg", brand: "CIMENTO QUEIMADO", type: "PRONTO P/ USO", res: "ACABAMENTO FINO", weight: "BALDE 5KG", bg: "#4E342E", accent: "#BF360C" },
  { file: "mizu-cpii-f.jpg", brand: "MIZU", type: "CP II-F 32", res: "RESISTENCIA 32 MPA", weight: "50 KG", bg: "#0277BD", accent: "#FFFFFF" },
  { file: "nassau-cpii-f.jpg", brand: "NASSAU", type: "CP II-F 32", res: "RESISTENCIA 32 MPA", weight: "50 KG", bg: "#0D47A1", accent: "#FFD600" },
  { file: "nassau-cpiii-40.jpg", brand: "NASSAU", type: "CP III 40", res: "RESISTENCIA 40 MPA", weight: "50 KG", bg: "#0D47A1", accent: "#FFD600" },
]

const W = 400, H = 400
const SX0 = 75, SY0 = 75, SX1 = 315, SY1 = 335, SR = 18
const CX = 195

function render(spec) {
  const bg = hex(spec.bg)
  const band = hex(spec.band || spec.bg)
  const buf = new Uint8Array(W * H * 4)
  for (let i = 0; i < W * H; i++) {
    buf[i * 4] = bg[0]; buf[i * 4 + 1] = bg[1]; buf[i * 4 + 2] = bg[2]; buf[i * 4 + 3] = 255
  }
  const inSack = (x, y) => inRounded(x, y, SX0, SY0, SX1, SY1, SR)
  // Sombra do saco
  for (let y = 82; y <= 342; y++)
    for (let x = 82; x <= 322; x++)
      if (inRounded(x, y, 82, 82, 322, 342, SR)) blend(buf, x, y, W, [0, 0, 0], 0.18)
  // Corpo do saco (branco)
  for (let y = SY0; y <= SY1; y++)
    for (let x = SX0; x <= SX1; x++)
      if (inSack(x + 0.5, y + 0.5)) setPx(buf, x, y, W, H, [255, 255, 255])
  // Borda do saco (só cimento branco, p/ contraste no fundo claro)
  if (spec.sackBorder) {
    const bc = hex(spec.sackBorder)
    for (let y = SY0; y <= SY1; y++)
      for (let x = SX0; x <= SX1; x++) {
        if (!inSack(x + 0.5, y + 0.5)) continue
        if (!inRounded(x + 0.5, y + 0.5, SX0 + 4, SY0 + 4, SX1 - 4, SY1 - 4, Math.max(1, SR - 4)))
          setPx(buf, x, y, W, H, bc)
      }
  }
  // Faixa superior da marca (respeita cantos arredondados)
  for (let y = SY0; y < 155; y++)
    for (let x = SX0; x <= SX1; x++)
      if (inSack(x + 0.5, y + 0.5)) setPx(buf, x, y, W, H, band)
  // Faixa de destaque da marca
  if (spec.accent) {
    const ac = hex(spec.accent)
    for (let y = 155; y < 163; y++)
      for (let x = SX0; x <= SX1; x++)
        if (inSack(x + 0.5, y + 0.5)) setPx(buf, x, y, W, H, ac)
  }
  // Costuras laterais tracejadas
  for (const lx of [90, 300]) {
    for (let y = 80; y <= 330; y++) {
      if (Math.floor((y - 80) / 14) % 2 === 0 && (y - 80) % 14 < 8)
        for (let dx = -1; dx <= 1; dx++) blend(buf, lx + dx, y, W, band, 0.4)
    }
  }
  // Nó do saco no topo
  for (let y = 65; y <= 85; y++)
    for (let x = 165; x <= 225; x++) {
      const dx = (x - 195) / 30, dy = (y - 75) / 10
      if (dx * dx + dy * dy <= 1) blend(buf, x, y, W, band, 0.5)
    }
  // Textos
  const brandScale = fitScale(stripAccents(spec.brand), 200, 4)
  drawText(buf, W, H, spec.brand, CX, 98, brandScale, [255, 255, 255])
  const typeScale = Math.min(brandScale, fitScale(stripAccents(spec.type), 200, 3))
  drawText(buf, W, H, spec.type, CX, 182, typeScale, hex(spec.typeColor || spec.band || spec.bg))
  drawText(buf, W, H, spec.res, CX, 214, 2, hex(spec.resColor || "#546E7A"))
  // Selo de peso
  const badge = hex(spec.badgeColor || spec.band || spec.bg)
  for (let y = 290; y <= 328; y++)
    for (let x = 130; x <= 260; x++) {
      if (!inRounded(x + 0.5, y + 0.5, 130, 290, 260, 328, 8)) continue
      blend(buf, x, y, W, badge, 0.16)
      if (!inRounded(x + 0.5, y + 0.5, 132, 292, 258, 326, 7)) setPx(buf, x, y, W, H, badge)
    }
  const wScale = fitScale(stripAccents(spec.weight), 112, 3)
  const wTop = 309 - Math.round((7 * wScale) / 2)
  drawText(buf, W, H, spec.weight, CX, wTop, wScale, badge)
  return buf
}

for (const spec of SPECS) {
  if (process.env.ONLY && !process.env.ONLY.split(",").includes(spec.file.replace(/\.jpg$/, ""))) continue
  const png = encodePNG(W, H, render(spec))
  fs.writeFileSync(path.join(DIR, spec.file), png)
  console.log(`✅ ${spec.file} (${(png.length / 1024).toFixed(1)} KB) — ${spec.brand} / ${spec.type}`)
}
console.log(`\n${SPECS.length} imagens exclusivas geradas em public/images/cimentos/.`)
