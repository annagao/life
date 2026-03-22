import { PNG } from "pngjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "../public");

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function rgbLerp(c1, c2, t) {
  return [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
}

function setPixel(png, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const i = (png.width * y + x) << 2;
  png.data[i] = r;
  png.data[i + 1] = g;
  png.data[i + 2] = b;
  png.data[i + 3] = a;
}

/** 薄荷绿 → 淡紫，偏「健康 / 舒缓」 */
function fillRadialGradient(png, cx, cy, cInner, cOuter) {
  const w = png.width;
  const h = png.height;
  const maxR = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot(x - cx, y - cy) / maxR;
      const t = Math.min(1, d * 1.08);
      const [r, g, b] = rgbLerp(cInner, cOuter, t);
      setPixel(png, x, y, r, g, b);
    }
  }
}

function fillCircle(png, cx, cy, rad, color) {
  const [r0, g0, b0] = color;
  const w = png.width;
  const h = png.height;
  const r2 = rad * rad;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        setPixel(png, x, y, r0, g0, b0);
      }
    }
  }
}

function fillEllipse(png, cx, cy, rx, ry, color) {
  const [r0, g0, b0] = color;
  const w = png.width;
  const h = png.height;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) {
        setPixel(png, x, y, r0, g0, b0);
      }
    }
  }
}

/** 经典心形隐式曲线 (x²+y²−1)³ − x²y³ ≤ 0，尖角朝下 */
function fillHeart(png, cx, cy, scale, color) {
  const [r0, g0, b0] = color;
  const w = png.width;
  const h = png.height;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x - cx) / scale;
      const ny = (cy - y) / scale;
      const a = nx * nx + ny * ny - 1;
      if (a * a * a - nx * nx * ny * ny * ny <= 0) {
        setPixel(png, x, y, r0, g0, b0);
      }
    }
  }
}

function makeIcon(size, filename) {
  const png = new PNG({ width: size, height: size });
  const s = size;
  const mint = [232, 245, 236];
  const lilac = [246, 234, 248];
  fillRadialGradient(png, s * 0.5, s * 0.42, mint, lilac);

  const gold = [240, 176, 96];
  const goldLight = [255, 228, 180];
  const snout = [255, 248, 240];
  const dark = [45, 45, 55];
  const nose = [42, 36, 32];
  const heart = [108, 184, 154];

  fillEllipse(png, s * 0.34, s * 0.33, s * 0.14, s * 0.12, gold);
  fillEllipse(png, s * 0.66, s * 0.33, s * 0.14, s * 0.12, gold);
  fillCircle(png, s * 0.5, s * 0.45, s * 0.18, goldLight);
  fillEllipse(png, s * 0.5, s * 0.52, s * 0.11, s * 0.09, snout);
  fillEllipse(png, s * 0.5, s * 0.54, s * 0.035, s * 0.028, nose);
  fillCircle(png, s * 0.42, s * 0.42, s * 0.022, dark);
  fillCircle(png, s * 0.58, s * 0.42, s * 0.022, dark);
  fillCircle(png, s * 0.425, s * 0.41, s * 0.008, [255, 255, 255]);
  fillCircle(png, s * 0.585, s * 0.41, s * 0.008, [255, 255, 255]);

  fillHeart(png, s * 0.76, s * 0.74, s * 0.085, heart);

  fs.writeFileSync(path.join(out, filename), PNG.sync.write(png));
}

fs.mkdirSync(out, { recursive: true });
makeIcon(192, "pwa-192x192.png");
makeIcon(512, "pwa-512x512.png");
makeIcon(180, "apple-touch-icon.png");
console.log("Wrote PWA icons to public/");
