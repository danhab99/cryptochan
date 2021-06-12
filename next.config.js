// next.config.js
const _ = require("lodash");
const cleanEnv = require("dotenv").config().parsed;

module.exports = {
  env: _.pick(cleanEnv, ["TITLE", "POLICY"]),
  future: {
    webpack5: true,
  },
};
