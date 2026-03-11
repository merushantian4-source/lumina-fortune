export const isLuminaDevMode = process.env.LUMINA_DEV_MODE === "true";

export function luminaDevLog(...args: unknown[]) {
  if (isLuminaDevMode) {
    console.log(...args);
  }
}

export function luminaDevWarn(...args: unknown[]) {
  if (isLuminaDevMode) {
    console.warn(...args);
  }
}

export function luminaDevError(...args: unknown[]) {
  if (isLuminaDevMode) {
    console.error(...args);
  }
}
