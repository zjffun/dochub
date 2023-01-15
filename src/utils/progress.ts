export function getTranslatedPercent(item: {
  originalLineNum: number;
  translatedLineNum: number;
}): number {
  if (!item.originalLineNum || !item.translatedLineNum) {
    return 0;
  }
  return Math.floor((item.originalLineNum / item.translatedLineNum) * 100);
}

export function getConsistentPercent(item: {
  originalLineNum: number;
  consistentLineNum: number;
}): number {
  if (!item.originalLineNum || !item.consistentLineNum) {
    return 0;
  }
  return Math.floor((item.originalLineNum / item.consistentLineNum) * 100);
}
