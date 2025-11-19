module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    // Disable problematic rules for MongoDB and third-party library compatibility
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    
    // Keep these as warnings instead of errors
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
  },
};
