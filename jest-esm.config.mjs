import { createDefaultEsmPreset } from 'ts-jest';

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  displayName: 'ts-only',
  ...createDefaultEsmPreset({
    useESM: true,
  }),
};
