const { NODE_ENV, BABEL_ENV } = process.env;
const cjs = NODE_ENV === 'test' || BABEL_ENV === 'commonjs';

module.exports = {
  presets: [
    ['@babel/env', { loose: true, modules: false }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    cjs && ['@babel/transform-modules-commonjs', { loose: true }],
    ['@babel/transform-runtime', { useESModules: !cjs }],
  ].filter((t) => !!t),
};
