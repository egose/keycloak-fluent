import cloneDeep from 'lodash-es/cloneDeep.js';

export function deepCloneInstance<T extends object>(instance: T): T {
  const proto = Object.getPrototypeOf(instance);
  const clone = Object.create(proto) as T;
  Object.assign(clone, cloneDeep(instance));
  return clone;
}
