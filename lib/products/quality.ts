/** A screen-color heuristic only; this does not certify a printed QR code. */
export function qrContrast(foreground: string, background: string): { ratio: number; darkOnLight: boolean } | null {
  const luminance = (hex: string): number | null => {
    if (!/^#[\da-f]{6}$/i.test(hex)) return null;
    const channels = [1, 3, 5].map((start) => {
      const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const dark = luminance(foreground);
  const light = luminance(background);
  if (dark === null || light === null) return null;
  return {
    ratio: (Math.max(dark, light) + 0.05) / (Math.min(dark, light) + 0.05),
    darkOnLight: dark < light,
  };
}
