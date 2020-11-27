module.exports = {
  extends: [
    "airbnb-typescript",
    "airbnb/hooks",
    "plugin:jest/recommended",
    "eslint:recommended",
    "prettier",
    "prettier/react",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
  plugins: ["react", "@typescript-eslint", "jest"],
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.extension.json"],
  },
  settings: {
    "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  rules: {
    "no-plusplus": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "linebreak-style": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "import/order": "off",
    "react/no-did-update-set-state": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "react/jsx-props-no-spreading": "off",
    "@typescript-eslint/no-shadow": "off",
    "react/destructuring-assignment": "off",
    "react/no-unused-state": "off",
    "no-underscore-dangle": 0,
    "@typescript-eslint/no-unused-vars": "off",
    "react/button-has-type": "off",
    "jsx-a11y/label-has-associated-control": "off",
    "no-nested-ternary": "off",
    "react-hooks/exhaustive-deps": "off",
    "import/extensions": "off",
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
        printWidth: 120,
      },
      {
        singleQuote: false,
      },
    ],
    "no-unused-vars": ["warn", { vars: "all", args: "after-used", ignoreRestSiblings: false }],
    "react/require-default-props": 0,
  },
};
