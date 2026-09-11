/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts', '**/*.test.ts', '**/*.spec.tsx', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@examen-fullstack/shared$': '<rootDir>/packages/shared/src',
    '^@examen-fullstack/backend$': '<rootDir>/apps/backend/src',
    '^@examen-fullstack/frontend/(.*)$': '<rootDir>/apps/frontend/src/$1',
  },
};
