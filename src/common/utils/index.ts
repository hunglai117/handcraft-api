export function getRankArray<T>(
  arr: T[],
  compareFn?: (a: number, b: number) => number,
): number[] {
  if (!Array.isArray(arr)) {
    throw new Error("Input must be an array.");
  }

  const indices = Array.from({ length: arr.length }, (_, i) => i);

  const defaultCompare = (a: number, b: number): number => {
    const valueA = arr[a];
    const valueB = arr[b];
    if (valueA < valueB) return -1;
    if (valueA > valueB) return 1;
    return 0;
  };

  const compare = compareFn || defaultCompare;

  indices.sort(compare);

  const ranks = new Array(arr.length);
  for (let i = 0; i < indices.length; i++) {
    ranks[indices[i]] = i;
  }

  return ranks;
}
