// next.config.js
const withTypescript = require("next");
module.exports = withTypescript({
  webpack(config, options) {
    return config;
  },
  env: {
    TITLE: "Cryptochan",
  },
});
