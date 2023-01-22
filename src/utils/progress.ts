export function getTranslatedPercent(item: {
  originalLineNum: number;
  translatedLineNum: number;
}): number {
  if (!item.originalLineNum || !item.translatedLineNum) {
    return 0;
  }
  return Math.floor((item.translatedLineNum / item.originalLineNum) * 100);
}

export function getConsistentPercent(item: {
  originalLineNum: number;
  consistentLineNum: number;
}): number {
  if (!item.originalLineNum || !item.consistentLineNum) {
    return 0;
  }
  return Math.floor((item.consistentLineNum / item.originalLineNum) * 100);
}
