module.exports = {
  testEnvironment: "node",
  roots: ["src"],
  collectCoverage: true,
  coverageReporters: ["text-summary", "cobertura", "lcov"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};