export const wrapLazyPromise = <T, M = undefined>(
  promiseFn: () => Promise<T>,
  meta?: M & { client: any },
): M & Promise<T> => {
  let isThenCalled = false;

  const prom: any = {
    then(onFulfilled: any, onRejected?: any) {
      isThenCalled = true;
      return promiseFn().then(onFulfilled, onRejected);
    },
    finally(onFinally: any) {
      if (isThenCalled) {
        return Promise.resolve().then(onFinally);
      }
      return Promise.resolve();
    },
    [Symbol.for('nodejs.util.inspect.custom')]() {
      return 'LazyPromise';
    },
  };

  Object.defineProperty(prom, Symbol.toStringTag, {
    value: 'Promise',
    writable: false,
    enumerable: false,
    configurable: true,
  });

  if (meta) {
    Object.assign(prom, meta); // copy own fields
    Object.setPrototypeOf(prom, Object.getPrototypeOf(meta)); // inherit methods
  }

  return prom as M & Promise<T>;
};
