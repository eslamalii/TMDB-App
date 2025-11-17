module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  coveragePathIgnorePatterns: [
    '/src/main.ts',
    '.module.ts$',
    '.entity.ts$',
    '.dto.ts$',
    '.guard.ts$',
    '.strategy.ts$',
    '/src/database/database.module.ts',
    '/src/seed/',
    'seed.ts$',
    '.controller.ts$',
  ],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 84,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
