const base = require("@mendix/pluggable-widgets-tools/configs/eslint.js.base.json");

module.exports = {
    ...base,
    ignorePatterns: [
        "src/fabric-history/src/index.min.js", // Specify the file to ignore
        // Add any other patterns you want to ignore
    ]
};
