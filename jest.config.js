// jest.config.js
/** @type {import('jest').Config} */
export default {
    testEnvironment: 'node',
    transform: {
      '^.+\\.(js|jsx|mjs)$': ['babel-jest', {
        presets: ['next/babel'],
        plugins: ['@babel/plugin-syntax-import-attributes']
      }]
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1'
    },
    transformIgnorePatterns: [
      'node_modules/(?!(@clerk|server-only)/.*)'
    ],
    setupFilesAfterEnv: [
      '<rootDir>/jest.setup.js'
    ]
  };