const { dirname } = require('path');
const { fileURLToPath } = require('url');
const { FlatCompat } = require('@eslint/eslintrc');

const __filename = fileURLToPath(require.main.filename);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

module.exports = eslintConfig; 