export type SinglePageQueryOptions = {
  page?: number;
  pageSize?: number;
  first?: number;
  max?: number;
};

export type SinglePageQuery = {
  first: number;
  max: number;
};

const defaultFirst = 0;
const defaultMax = 100;
const defaultPage = 1;
const defaultPageSize = 100;

function validateInteger(name: string, value: number, minimum: number): void {
  if (!Number.isFinite(value) || !Number.isInteger(value) || !Number.isSafeInteger(value) || value < minimum) {
    throw new RangeError(`${name} must be a finite safe integer >= ${minimum} (received ${String(value)})`);
  }
}

function validateRange(first: number, max: number, context: string): void {
  if (first > Number.MAX_SAFE_INTEGER - (max - 1)) {
    throw new RangeError(`${context} first/max range exceeds Number.MAX_SAFE_INTEGER`);
  }
}

/**
 * Converts single-page query options to Keycloak's `first`/`max` parameters.
 * Callers must choose either page/pageSize or first/max; mixing styles is
 * rejected to avoid ambiguous precedence.
 */
export function toSinglePageQuery(options: SinglePageQueryOptions = {}, context = 'pagination'): SinglePageQuery {
  const hasPageStyle = options.page !== undefined || options.pageSize !== undefined;
  const hasOffsetStyle = options.first !== undefined || options.max !== undefined;

  if (hasPageStyle && hasOffsetStyle) {
    throw new RangeError(`${context} options must use either page/pageSize or first/max, not both`);
  }

  if (hasOffsetStyle) {
    const first = options.first ?? defaultFirst;
    const max = options.max ?? defaultMax;

    validateInteger(`${context}.first`, first, 0);
    validateInteger(`${context}.max`, max, 1);
    validateRange(first, max, context);

    return { first, max };
  }

  const page = options.page ?? defaultPage;
  const pageSize = options.pageSize ?? defaultPageSize;

  validateInteger(`${context}.page`, page, 1);
  validateInteger(`${context}.pageSize`, pageSize, 1);

  const first = (page - 1) * pageSize;
  if (!Number.isSafeInteger(first)) {
    throw new RangeError(`${context} page/pageSize offset exceeds Number.MAX_SAFE_INTEGER`);
  }
  validateRange(first, pageSize, context);

  return { first, max: pageSize };
}
