export default {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"], // add this
    transform: {
        "^.+\\.(ts|tsx|js|jsx)$": ["babel-jest", { configFile: "./babel.config.test.cjs" }],
    },
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
        "^@repo/ui/(.*)$": "<rootDir>/../../packages/ui/src/$1",
    },
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
};
