/* =============================================================================
 * FAVICON C&C — gera public/icon.png (512) e public/favicon.ico (48+32)
 * Monograma branco com & laranja #F47920 sobre azul marinho #002D5B,
 * borda clara para contraste em abas dark/light. PNG + ICO puros via zlib.
 * Uso: node scripts/gerar_favicon_cec.js
 * ============================================================================= */
const fs = require("fs")
const path = require("path")
const zlib = require("zlib")

const NAVY = [0x00, 0x2d, 0x5b, 255]
const WHITE = [255, 255, 255, 255]
const ORANGE = [0xf4, 0x79, 0x20, 255]
const RING = [255, 255, 255, 90]

const GLYPHS = {
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  "&": [".##..", "#..#.", "#.#..", ".#...", "#.#.#", "#..#.", ".##.#"],
}

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
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))])
}

function inRounded(x, y, x0, y0, x1, y1, r) {
  if (x >= x0 + r && x <= x1 - r) return y >= y0 && y <= y1
  if (y >= y0 + r && y <= y1 - r) return x >= x0 && x <= x1
  const cx = x < x0 + r ? x0 + r : x1 - r
  const cy = y < y0 + r ? y0 + r : y1 - r
  const dx = x - cx, dy = y - cy
  return dx * dx + dy * dy <= r * r
}

function render(size) {
  const buf = new Uint8Array(size * size * 4) // transparente
  const R = Math.round((112 / 512) * size)
  const ringInset = Math.round((16 / 512) * size)
  const ringW = Math.max(2, Math.round((8 / 512) * size))
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      if (!inRounded(x + 0.5, y + 0.5, 0, 0, size, size, R)) continue
      const inInner = inRounded(x + 0.5, y + 0.5, ringInset + ringW, ringInset + ringW, size - ringInset - ringW, size - ringInset - ringW, Math.max(1, R - ringInset - ringW))
      const onRing = inRounded(x + 0.5, y + 0.5, ringInset, ringInset, size - ringInset, size - ringInset, Math.max(1, R - ringInset)) && !inInner
      const c = onRing ? RING : NAVY
      buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = c[3]
    }
  }
  // Monograma C&C
  const unit = Math.max(1, Math.round(size * 0.0508)) // 26px @512
  const gw = 5 * unit, gh = 7 * unit, gap = unit
  const totalW = gw * 3 + gap * 2
  const x0 = Math.round((size - totalW) / 2)
  const y0 = Math.round((size - gh) / 2) + Math.round(size * 0.008)
  const seq = [["C", WHITE], ["&", ORANGE], ["C", WHITE]]
  seq.forEach(([ch, color], k) => {
    const gx = x0 + k * (gw + gap)
    const rows = GLYPHS[ch]
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 5; c++) {
        if (rows[r][c] !== "#") continue
        for (let dy = 0; dy < unit; dy++) {
          for (let dx = 0; dx < unit; dx++) {
            const x = gx + c * unit + dx, y = y0 + r * unit + dy
            if (x < 0 || y < 0 || x >= size || y >= size) continue
            const j = (y * size + x) * 4
            buf[j] = color[0]; buf[j + 1] = color[1]; buf[j + 2] = color[2]; buf[j + 3] = 255
          }
        }
      }
    }
  })
  return buf
}

function downsample(src, srcSize, dstSize) {
  const out = new Uint8Array(dstSize * dstSize * 4)
  for (let y = 0; y < dstSize; y++) {
    for (let x = 0; x < dstSize; x++) {
      const sx = Math.min(srcSize - 1, Math.floor((x + 0.5) * (srcSize / dstSize)))
      const sy = Math.min(srcSize - 1, Math.floor((y + 0.5) * (srcSize / dstSize)))
      const s = (sy * srcSize + sx) * 4, d = (y * dstSize + x) * 4
      out[d] = src[s]; out[d + 1] = src[s + 1]; out[d + 2] = src[s + 2]; out[d + 3] = src[s + 3]
    }
  }
  return out
}

function buildICO(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4)
  let offset = 6 + 16 * images.length
  const dirs = []
  const datas = []
  for (const { size, png } of images) {
    const dir = Buffer.alloc(16)
    dir[0] = size >= 256 ? 0 : size
    dir[1] = size >= 256 ? 0 : size
    dir[2] = 0; dir[3] = 0
    dir.writeUInt16LE(1, 4); dir.writeUInt16LE(32, 6)
    dir.writeUInt32LE(png.length, 8); dir.writeUInt32LE(offset, 12)
    offset += png.length
    dirs.push(dir); datas.push(png)
  }
  return Buffer.concat([header, ...dirs, ...datas])
}

const pub = (f) => path.resolve(process.cwd(), "public", f)
const big = render(512)
fs.writeFileSync(pub("icon.png"), encodePNG(512, 512, big))
console.log("✅ public/icon.png (512x512 C&C)")
const ico = buildICO([
  { size: 48, png: encodePNG(48, 48, downsample(big, 512, 48)) },
  { size: 32, png: encodePNG(32, 32, downsample(big, 512, 32)) },
])
fs.writeFileSync(pub("favicon.ico"), ico)
console.log("✅ public/favicon.ico (48px + 32px C&C)")
