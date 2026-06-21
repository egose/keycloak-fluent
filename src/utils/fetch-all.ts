const defaultPageSize = 100;

export async function fetchAll<T>(fetcher: (first: number, max: number) => Promise<T[]>): Promise<T[]> {
  const all: T[] = [];
  let first = 0;

  for (;;) {
    const page = await fetcher(first, defaultPageSize);

    if (!page || page.length === 0) {
      break;
    }

    all.push(...page);

    if (page.length < defaultPageSize) {
      break;
    }

    first += defaultPageSize;
  }

  return all;
}
