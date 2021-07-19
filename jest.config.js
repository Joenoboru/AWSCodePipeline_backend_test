// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { defaults } = require('jest-config');
module.exports = {
    verbose: false,
    setupFilesAfterEnv: [
        './jest-setup.js',
    ],
    coverageDirectory: "coverage",
    preset: 'ts-jest',
    testEnvironment: "node",
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    "testResultsProcessor": "./node_modules/jest-html-reporter",
    "reporters": [
        "default",
        ["./node_modules/jest-html-reporter", {
            "pageTitle": "Test Report"
        }]
    ]
};