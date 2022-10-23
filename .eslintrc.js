module.exports = {
  extends: "airbnb-typescript-prettier",
  rules: {
    "import/prefer-default-export": 0,
    "react/function-component-definition": [
      2,
      { namedComponents: "arrow-function" },
    ],
    "react/require-default-props": 0,
  },
};
