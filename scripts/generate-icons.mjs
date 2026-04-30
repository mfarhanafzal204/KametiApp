/**
 * Pure Node.js PNG icon generator — zero dependencies.
 * Writes icon-192.png and icon-512.png to /public
 * Run: node scripts/generate-icons.mjs
 */

import { writeFileSync } from "fs";
import { createDeflate } from "zlib";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");

// ── CRC32 table ───────────────────────────────────────────────────────────────
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function uint32BE(n) {
  return Buffer.from([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const lenBuf    = uint32BE(data.length);
  const crcInput  = Buffer.concat([typeBytes, data]);
  const crcBuf    = uint32BE(crc32(crcInput));
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

// ── Draw icon pixels ──────────────────────────────────────────────────────────
function drawIcon(size) {
  // RGBA pixel buffer
  const pixels = new Uint8Array(size * size * 4);

  const cx = size / 2;
  const cy = size / 2;
  const r  = size / 2;          // outer circle radius
  const ir = size * 0.30;       // inner white circle radius

  // Green brand colour #16a34a → rgb(22, 163, 74)
  const BG_R = 22, BG_G = 163, BG_B = 74;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const dx = px - cx + 0.5;
      const dy = py - cy + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const idx  = (py * size + px) * 4;

      if (dist > r) {
        // Outside circle — transparent
        pixels[idx]     = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
      } else if (dist < ir) {
        // Inner white circle (semi-transparent overlay)
        pixels[idx]     = 255;
        pixels[idx + 1] = 255;
        pixels[idx + 2] = 255;
        pixels[idx + 3] = 40; // very subtle
      } else {
        // Green background
        pixels[idx]     = BG_R;
        pixels[idx + 1] = BG_G;
        pixels[idx + 2] = BG_B;
        pixels[idx + 3] = 255;
      }
    }
  }

  // Draw a simple "K" letter in white at the centre
  // We'll draw thick strokes manually for a clean look
  drawLetter(pixels, size, cx, cy);

  return encodePNG(pixels, size, size);
}

// ── Draw a bold "K" shape ─────────────────────────────────────────────────────
function drawLetter(pixels, size, cx, cy) {
  const s = size / 192; // scale factor relative to 192px base

  function setPixel(x, y, alpha = 255) {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || py < 0 || px >= size || py >= size) return;
    const idx = (py * size + px) * 4;
    pixels[idx]     = 255;
    pixels[idx + 1] = 255;
    pixels[idx + 2] = 255;
    pixels[idx + 3] = alpha;
  }

  function fillRect(x, y, w, h) {
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++)
        setPixel(x + dx, y + dy);
  }

  // "K" glyph — drawn as filled rectangles
  const stroke = Math.max(2, Math.round(14 * s)); // stroke width
  const height = Math.round(80 * s);
  const width  = Math.round(60 * s);
  const startX = Math.round(cx - width / 2);
  const startY = Math.round(cy - height / 2);

  // Vertical bar (left stem)
  fillRect(startX, startY, stroke, height);

  // Upper diagonal arm — from mid-right going up-right
  const midY = startY + Math.round(height / 2);
  const armLen = Math.round(height / 2);
  for (let i = 0; i < armLen; i++) {
    const t = i / armLen;
    const ax = Math.round(startX + stroke + t * (width - stroke));
    const ay = Math.round(midY - t * armLen);
    fillRect(ax, ay, stroke, stroke);
  }

  // Lower diagonal arm — from mid-right going down-right
  for (let i = 0; i < armLen; i++) {
    const t = i / armLen;
    const ax = Math.round(startX + stroke + t * (width - stroke));
    const ay = Math.round(midY + t * armLen);
    fillRect(ax, ay, stroke, stroke);
  }
}

// ── Encode raw RGBA to PNG ────────────────────────────────────────────────────
function encodePNG(pixels, width, height) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8]  = 8;  // bit depth
  ihdr[9]  = 6;  // colour type: RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  // Raw image data with filter byte (0 = None) per scanline
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst]     = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }

  const compressed = deflateSync(raw, { level: 6 });

  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Write files ───────────────────────────────────────────────────────────────
writeFileSync(resolve(publicDir, "icon-192.png"), drawIcon(192));
writeFileSync(resolve(publicDir, "icon-512.png"), drawIcon(512));
console.log("✓ icon-192.png and icon-512.png written to /public");
