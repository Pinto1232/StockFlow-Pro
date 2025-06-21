module.exports = {
  testEnvironment: 'jsdom',
  
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  
  collectCoverage: true,
  collectCoverageFrom: [
    '../wwwroot/js/**/*.js',
    '!../wwwroot/js/**/*.min.js',
    '!../wwwroot/lib/**/*.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/wwwroot/lib/'
  ],
  
  globals: {
    'window': {},
    'document': {},
    'navigator': {
      userAgent: 'node.js'
    }
  }
};