import _mergeWith from 'lodash-es/mergeWith.js';

function replaceArrays(_objValue: unknown, srcValue: unknown) {
  if (Array.isArray(srcValue)) {
    return [...srcValue];
  }

  return undefined;
}

type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

type NonNullableSource<T> = T extends null | undefined ? never : T;

export function mergeUpdateData<Sources extends readonly object[]>(
  ...sources: Sources
): UnionToIntersection<NonNullableSource<Sources[number]>> & object {
  return _mergeWith({}, ...sources, replaceArrays);
}
