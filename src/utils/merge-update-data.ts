import _mergeWith from 'lodash-es/mergeWith.js';

function replaceArrays(_objValue: unknown, srcValue: unknown) {
  if (Array.isArray(srcValue)) {
    return [...srcValue];
  }

  return undefined;
}

export function mergeUpdateData(...sources: unknown[]) {
  return _mergeWith({}, ...sources, replaceArrays);
}
