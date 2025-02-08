export default {
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    },
    extensionsToTreatAsEsm: [".ts", ".tsx", ".js", ".jsx"],
    globals: {
        "ts-jest": {
            useESM: true
        }
    }
};
