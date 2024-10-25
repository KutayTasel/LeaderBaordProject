module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 30000, // Tüm testler için 30 saniye zaman aşımı
  testMatch: ["**/tests/**/*.test.ts"],
  moduleFileExtensions: ["js", "json", "ts"],
  roots: ["<rootDir>"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
};
