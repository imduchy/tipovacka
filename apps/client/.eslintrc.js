module.exports = {
    ...require("@tipovacka/config/eslint-preset"),
    parserOptions: {
        root: true,
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"]
    }
}
