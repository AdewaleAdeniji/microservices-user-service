const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    metaData:{
      type: Object,
      default: {},
    },
    hasPassword: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    appID: {
      type: String,
      default: 'default',
    },
    userID: {
      immutable: true,
      type: String,
    },
    email: String,
    password: String,
    status: {
      default: true,
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);
exports.users = userSchema;
module.exports = mongoose.model("users", userSchema);
