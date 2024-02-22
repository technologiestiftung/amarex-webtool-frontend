module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: ["eslint:recommended", "plugin:vue/vue3-essential"],
    overrides: [
        {
            env: {
                node: true,
            },
            files: [".eslintrc.{js,cjs}"],
            parserOptions: {
                sourceType: "script",
            },
        },
    ],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: ["vue"],
    rules: {
        "no-console": "off",
        "no-unused-vars": "off",
        "no-undef": "off",
        "backbone/no-collection-models": "off",
        "vue/no-deprecated-destroyed-lifecycle": "off",
        "vue/no-v-for-template-key-on-child": "off",
        "vue/no-deprecated-events-api": "off",
        "vue/no-deprecated-slot-attribute": "off",
        "vue/no-deprecated-slot-scope-attribute": "off",
        "vue/no-deprecated-v-on-native-modifier": "off",
        "no-control-regex": "off",
    },
};

