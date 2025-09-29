// jest.config.js

export default {
  testEnvironment: 'node',
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  globals: {
    MONGODB_URI: 'mongodb://localhost:27017/test',
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
};