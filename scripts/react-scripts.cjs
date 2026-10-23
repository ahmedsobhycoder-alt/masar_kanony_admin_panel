// Keep app source maps, but skip the broken maps shipped by stylis-plugin-rtl.
const action = process.argv[2];
if (!['start', 'build'].includes(action)) {
  throw new Error('Expected start or build');
}

process.env.NODE_ENV = action === 'build' ? 'production' : 'development';
process.env.BABEL_ENV = process.env.NODE_ENV;

const configPath = require.resolve('react-scripts/config/webpack.config');
const createConfig = require(configPath);
const rtlPackage = /[\\/]node_modules[\\/]stylis-plugin-rtl[\\/]/;

require.cache[configPath].exports = (environment) => {
  const config = createConfig(environment);
  for (const rule of config.module.rules) {
    if (typeof rule.loader === 'string' && rule.loader.includes('source-map-loader')) {
      rule.exclude = rule.exclude ? [rule.exclude, rtlPackage] : rtlPackage;
    }
  }
  return config;
};

require(`react-scripts/scripts/${action}`);
