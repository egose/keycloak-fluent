import { describe, expect, expectTypeOf, test } from 'vitest';
import { mergeUpdateData } from '../src/utils/merge-update-data';

describe('Implementation: mergeUpdateData runtime behavior', () => {
  test('merges flat scalars with later sources overriding earlier ones', () => {
    const result = mergeUpdateData({ a: 1, b: 2 }, { b: 3, c: 4 });
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  test('replaces whole arrays (copy-on-replace) without index-wise merging', () => {
    const result = mergeUpdateData({ tags: ['a', 'b', 'c'] }, { tags: ['x'] });
    expect(result).toEqual({ tags: ['x'] });
    expect((result as { tags: unknown[] }).tags).not.toBe(['a', 'b', 'c']);
  });

  test('array replacement clones the new array so the source cannot be mutated later', () => {
    const incoming: { tags: string[] } = { tags: ['x', 'y'] };
    const result = mergeUpdateData({ tags: ['a', 'b', 'c'] }, incoming);
    incoming.tags.push('z');
    expect(result).toEqual({ tags: ['x', 'y'] });
  });

  test('null in a later source overrides the earlier scalar and is preserved', () => {
    const result = mergeUpdateData({ a: 1 }, { a: null });
    expect(result).toEqual({ a: null });
  });

  test('undefined keys are dropped during recursive merge (lodash behavior)', () => {
    const result = mergeUpdateData({ a: 1, b: 2 }, { b: undefined, c: 3 });
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  test('top-level undefined sources are skipped at runtime (lodash coerces them)', () => {
    const result = mergeUpdateData({ a: 1 }, undefined as unknown as object, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test('top-level null sources are skipped at runtime (lodash coerces them)', () => {
    const result = mergeUpdateData({ a: 1 }, null as unknown as object, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  test('nested objects are merged recursively rather than replaced wholesale', () => {
    const result = mergeUpdateData({ meta: { x: 1, y: 2 }, name: 'old' }, { meta: { y: 9, z: 3 } });
    expect(result).toEqual({ meta: { x: 1, y: 9, z: 3 }, name: 'old' });
  });

  test('nested arrays inside nested objects are replaced, not concatenated', () => {
    const result = mergeUpdateData({ meta: { items: [1, 2, 3] } }, { meta: { items: [9] } });
    expect(result).toEqual({ meta: { items: [9] } });
  });

  test('null nested object in a later source overrides the earlier nested object', () => {
    const result = mergeUpdateData({ meta: { x: 1 } } as { meta: { x: number } | null }, { meta: null });
    expect(result).toEqual({ meta: null });
  });

  test('merging three sources applies overrides left-to-right', () => {
    const result = mergeUpdateData(
      { name: 'old', id: 'uuid-1' } as { name: string; id?: string },
      { name: 'middle' } as { name?: string },
      { id: 'uuid-2' },
    );
    expect(result).toEqual({ name: 'middle', id: 'uuid-2' });
  });

  test('does not mutate its first source argument', () => {
    const base = { a: 1, nested: { x: 1 } };
    const frozenBase = structuredClone(base);
    mergeUpdateData(base, { a: 9, nested: { y: 2 } });
    expect(base).toEqual(frozenBase);
  });

  test('handles empty source list by producing an empty record', () => {
    const result = mergeUpdateData();
    expect(result).toEqual({});
  });

  test('handles a single source by returning a deep clone of it', () => {
    const source: { a: number; nested: { x: number } } = { a: 1, nested: { x: 1 } };
    const result = mergeUpdateData(source);
    expect(result).toEqual(source);
    (result as { nested: { x: number } }).nested.x = 99;
    expect(source.nested.x).toBe(1);
  });
});

describe('Implementation: mergeUpdateData return type', () => {
  test('intersects source shapes so all source keys are observable on the result', () => {
    const result = mergeUpdateData({ a: 1 }, { b: 'two' }, { c: true });
    expectTypeOf(result).toExtend<{ a: number; b: string; c: boolean }>();
    expect(result).toEqual({ a: 1, b: 'two', c: true });
  });

  test('the constrained return reflects that of a Keycloak representation merged with overrides', () => {
    type RoleRep = { id?: string; name?: string; composite?: boolean };
    const result = mergeUpdateData(
      { id: 'r-1', composite: true } as RoleRep,
      { name: 'override' } as Partial<RoleRep>,
      { name: 'final' },
    );
    expectTypeOf(result).toExtend<RoleRep>();
    expect(result).toEqual({ id: 'r-1', composite: true, name: 'final' });
  });

  test('object-only constraint: the function type accepts object sources', () => {
    expectTypeOf(mergeUpdateData).toBeCallableWith({ a: 1 }, { b: 2 });
  });
});
