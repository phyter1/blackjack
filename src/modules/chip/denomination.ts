// export interface ChipColor {
//   value: number;
//   hex: string;
// }

// export interface ChipPaletteOptions {
//   min?: number; // default 0.01
//   max?: number; // default 10000
// }

// /**
//  * Generate a full, consistent casino chip palette for a given base color.
//  * - baseHex: e.g. "#3B82F6"
//  * - options: optional min/max if you want to adjust range
//  */
// export function generateCasinoChipPalette(
//   baseHex: string,
//   options: ChipPaletteOptions = {},
// ): ChipColor[] {
//   const min = options.min ?? 0.01;
//   const max = options.max ?? 10000;

//   if (min <= 0 || max <= 0 || min >= max) {
//     throw new Error("min must be > 0 and < max");
//   }

//   const denominations = generate125Denominations(min, max);
//   if (denominations.length === 0) {
//     return [];
//   }

//   const { h: baseH } = hexToHsl(baseHex);

//   const n = denominations.length;
//   const hueSpread = 36; // keep everything within a ~modern/consistent arc

//   return denominations.map((value, index) => {
//     const t = n === 1 ? 0 : index / (n - 1); // 0..1

//     // Slight hue drift around base color for visual interest
//     const h = (baseH + (t - 0.5) * hueSpread + 360) % 360;

//     // Saturation curve: more saturated in the middle of the range
//     // ranges roughly 55–80
//     const s = clamp(55 + 25 * Math.sin(Math.PI * t), 45, 85);

//     // Lightness: lighter for low denominations, darker for high
//     // ranges roughly 65 -> 35
//     const l = clamp(65 - 30 * t, 30, 70);

//     const hex = hslToHex(h, s, l);

//     return { value, hex };
//   });
// }

// /**
//  * Generate 1–2–5 denominations across powers of 10, between min and max (inclusive where applicable).
//  * E.g. 0.01–10000 => 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, ... , 5000, 10000
//  */
// export function generate125Denominations(min: number, max: number): number[] {
//   const eps = 1e-9;
//   const result: number[] = [];

//   let exp = Math.floor(Math.log10(min));

//   // Safety guard to avoid infinite loops if something goes horribly wrong
//   let safeguard = 0;

//   outer: while (safeguard++ < 1000) {
//     const base = 10 ** exp;
//     for (const m of [1, 2, 5]) {
//       const val = m * base;

//       if (val < min - eps) continue;
//       if (val > max + eps) {
//         break outer;
//       }

//       result.push(roundTo(val, 2));
//     }
//     exp++;
//   }

//   return result;
// }

// // ---------- Color utilities ----------

// interface Hsl {
//   h: number; // 0–360
//   s: number; // 0–100
//   l: number; // 0–100
// }

// interface Rgb {
//   r: number; // 0–255
//   g: number; // 0–255
//   b: number; // 0–255
// }

// /**
//  * Convert hex color to HSL.
//  * Accepts "#RRGGBB" or "RRGGBB". (3-digit can be added if you want.)
//  */
// export function hexToHsl(hex: string): Hsl {
//   const { r, g, b } = hexToRgb(hex);

//   const rNorm = r / 255;
//   const gNorm = g / 255;
//   const bNorm = b / 255;

//   const max = Math.max(rNorm, gNorm, bNorm);
//   const min = Math.min(rNorm, gNorm, bNorm);
//   let h = 0;
//   let s = 0;
//   const l = (max + min) / 2;

//   if (max !== min) {
//     const d = max - min;
//     s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

//     switch (max) {
//       case rNorm:
//         h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
//         break;
//       case gNorm:
//         h = (bNorm - rNorm) / d + 2;
//         break;
//       case bNorm:
//         h = (rNorm - gNorm) / d + 4;
//         break;
//     }

//     h /= 6;
//   }

//   return {
//     h: h * 360,
//     s: s * 100,
//     l: l * 100,
//   };
// }

// /**
//  * Convert HSL (degrees, %, %) to hex color.
//  */
// export function hslToHex(h: number, s: number, l: number): string {
//   const { r, g, b } = hslToRgb(h, s, l);
//   return rgbToHex(r, g, b);
// }

// export function hexToRgb(hex: string): Rgb {
//   let clean = hex.trim();
//   if (clean.startsWith("#")) clean = clean.slice(1);

//   if (clean.length === 3) {
//     // Expand shorthand #RGB into #RRGGBB
//     clean = clean
//       .split("")
//       .map((c) => c + c)
//       .join("");
//   }

//   if (clean.length !== 6) {
//     throw new Error(`Invalid hex color: "${hex}"`);
//   }

//   const num = parseInt(clean, 16);
//   const r = (num >> 16) & 0xff;
//   const g = (num >> 8) & 0xff;
//   const b = num & 0xff;

//   return { r, g, b };
// }

// export function hslToRgb(h: number, s: number, l: number): Rgb {
//   const hNorm = ((h % 360) + 360) % 360 / 360; // 0–1
//   const sNorm = clamp(s, 0, 100) / 100;
//   const lNorm = clamp(l, 0, 100) / 100;

//   let r: number, g: number, b: number;

//   if (sNorm === 0) {
//     // achromatic
//     r = g = b = lNorm;
//   } else {
//     const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
//     const p = 2 * lNorm - q;

//     const hue2rgb = (pVal: number, qVal: number, t: number): number => {
//       if (t < 0) t += 1;
//       if (t > 1) t -= 1;
//       if (t < 1 / 6) return pVal + (qVal - pVal) * 6 * t;
//       if (t < 1 / 2) return qVal;
//       if (t < 2 / 3) return pVal + (qVal - pVal) * (2 / 3 - t) * 6;
//       return pVal;
//     };

//     r = hue2rgb(p, q, hNorm + 1 / 3);
//     g = hue2rgb(p, q, hNorm);
//     b = hue2rgb(p, q, hNorm - 1 / 3);
//   }

//   return {
//     r: Math.round(r * 255),
//     g: Math.round(g * 255),
//     b: Math.round(b * 255),
//   };
// }

// export function rgbToHex(r: number, g: number, b: number): string {
//   const toHex = (v: number) =>
//     clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");

//   return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
// }

// // ---------- Small helpers ----------

// function clamp(value: number, min: number, max: number): number {
//   return Math.min(max, Math.max(min, value));
// }

// function roundTo(value: number, decimals: number): number {
//   const factor = 10 ** decimals;
//   return Math.round((value + Number.EPSILON) * factor) / factor;
// }

// console.log("generated chip palette:", generateCasinoChipPalette("#3B82F6"));

// const p = [
//   {
//     value: 0.01,
//     hex: "#75b7d7",
//   },
//   {
//     value: 0.02,
//     hex: "#6ab2d9",
//   },
//   {
//     value: 0.05,
//     hex: "#5fabdb",
//   },
//   {
//     value: 0.1,
//     hex: "#54a4de",
//   },
//   {
//     value: 0.2,
//     hex: "#499ce0",
//   },
//   {
//     value: 0.5,
//     hex: "#3f93e2",
//   },
//   {
//     value: 1,
//     hex: "#3489e4",
//   },
//   {
//     value: 2,
//     hex: "#2b7ee5",
//   },
//   {
//     value: 5,
//     hex: "#2273e6",
//   },
//   {
//     value: 10,
//     hex: "#1967e6",
//   },
//   {
//     value: 20,
//     hex: "#195ddd",
//   },
//   {
//     value: 50,
//     hex: "#1a54d4",
//   },
//   {
//     value: 100,
//     hex: "#1b4ccb",
//   },
//   {
//     value: 200,
//     hex: "#1d45c0",
//   },
//   {
//     value: 500,
//     hex: "#1f3fb6",
//   },
//   {
//     value: 1000,
//     hex: "#213aab",
//   },
//   {
//     value: 2000,
//     hex: "#2436a0",
//   },
//   {
//     value: 5000,
//     hex: "#263395",
//   },
//   {
//     value: 10000,
//     hex: "#28308a",
//   },
// ];
