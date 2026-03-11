export function containsUrl(text: string): boolean {
  const urlPattern = /(https?:\/\/|www\.|\.com|\.net|\.xyz|\.site|\.link|\.info)/i;
  return urlPattern.test(text);
}
