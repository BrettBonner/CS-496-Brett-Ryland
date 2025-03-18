module.exports = {
  // Mock testing environment, also responsible for translating between .js files and ES6
  testEnvironment: "jest-environment-jsdom",
  collectCoverage: true,
  coverageReporters: ["text", "text-summary", "html"],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  // Essential for mocking CSS files for React components
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
};  