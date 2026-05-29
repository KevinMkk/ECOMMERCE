const path = require('path');

module.exports = {
  testEnvironment: 'node',
  testTimeout: 180000,
  globalSetup: '<rootDir>/tests/globalSetup.cjs',
  globalTeardown: '<rootDir>/tests/globalTeardown.cjs',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  verbose: true,
};
