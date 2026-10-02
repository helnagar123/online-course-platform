export default {
  testEnvironment: 'node',

  roots: ['<rootDir>/tests'],

  testMatch: [
    '**/*.test.js'
  ],

  setupFiles: [
    '<rootDir>/tests/setup.js'
  ],

  clearMocks: true,

  coverageDirectory: 'coverage',

  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**'
  ]
};