require("dotenv").config();

exports.config = {
  LOG_KEY: process.env.LOG_KEY,
  API_KEYS_SALT: process.env.API_KEYS_SALT,
};
exports.algorithm = "aes-256-ctr";
