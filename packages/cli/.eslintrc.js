module.exports = {
  extends: ["@xats/eslint-config"],
  rules: {
    // CLI tools need console statements for output
    "no-console": "off",
  },
};