export function getPercent(numerator?: number, denominator?: number): number {
  if (!numerator || !denominator) {
    return 0;
  }
  return Math.floor((denominator / numerator) * 100);
}
