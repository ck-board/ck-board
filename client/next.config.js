const withSass = require('@zeit/next-sass');
const path = require('path')
const nextRuntimeDotenv = require('next-runtime-dotenv');

const withConfig = nextRuntimeDotenv({
  public: ['API_URL', 'FACEBOOK_CLIENT_ID', 'GOOGLE_CLIENT_ID', 'KAKAOTALK_CLIENT_ID'],
  server: ['API_URL', 'FACEBOOK_CLIENT_ID', 'GOOGLE_CLIENT_ID', 'KAKAOTALK_CLIENT_ID'],
});

const aliases = ['components', 'models', 'store', 'styles', 'interfaces', 'static', 'utils'];

module.exports = withConfig(withSass({
  webpack(config, options) {
    aliases.forEach((alias) => {
      config.resolve.alias[alias] = path.join(__dirname, alias);
    });

    config.module.rules.forEach((rule) => {
      if (String(rule.test) === String(/\.sass$/)) {
        rule.use.push({
          loader: 'sass-resources-loader',
          options: {
            resources: [
              './styles/global/_mixin.scss',
              './styles/global/_variables.scss',
            ],
          },
        });
      }
    });

    return config;
  },
  cssModules: false,
  sassLoaderOptions: {},
}));
