// next.config.js
module.exports = {
  webpack(config, options) {
    return config;
  },
  env: {
    TITLE: "Cryptochan",
  },
  future: {
    webpack5: true,
  },
};
