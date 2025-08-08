module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // This is the key part that tells Jest how to resolve the alias.
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  // Ensure Jest processes both TS and JS files.
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: '(/tests/.*|(\\.|/)(test|spec))\\.ts?$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
