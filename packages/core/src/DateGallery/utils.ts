export function _hasOverlap(
  a: {
    startDate: Date;
    endDate: Date;
  },
  b: {
    startDate: Date;
    endDate: Date;
  }
): boolean {
  const earlier = a.startDate < b.startDate ? a : b;
  const later = earlier === a ? b : a;

  const laterStart = later.startDate.getTime();

  const earlierStart = earlier.startDate.getTime();
  const earlierEnd = earlier.endDate.getTime();

  return laterStart >= earlierStart && laterStart < earlierEnd;
}
