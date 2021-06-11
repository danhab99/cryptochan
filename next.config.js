// next.config.js
require("dotenv").config();
module.exports = {
  webpack(config, options) {
    return config;
  },
  env: process.env,
  future: {
    webpack5: true,
  },
};
