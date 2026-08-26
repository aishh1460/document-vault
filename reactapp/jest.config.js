module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    html: '<!DOCTYPE html><html><head></head><body></body></html>',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(axios)/)'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(svg|png|jpg|jpeg|gif)$': '<rootDir>/src/__mocks__/fileMock.js',
  }
};
