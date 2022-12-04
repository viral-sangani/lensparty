module.exports = {
  root: true,
  extends: ['weblint'],
  rules: {
    'unused-imports/no-unused-imports': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-console': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'prefer-destructuring': 'off',
    'react/jsx-no-useless-fragment': 'off'
  }
};
