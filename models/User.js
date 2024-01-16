const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    metaData: {
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
      immutable: true,
    },
    userType: {
      type: String,
      default: "user",
    },
    appID: {
      type: String,
      default: "default",
      immutable: true,
    },
    userID: {
      immutable: true,
      type: String,
    },
    emailVerified : {
      type: Boolean,
      default: false,
    },
    emailVerificationType: {
      type: String,
      default: "default",
    },
    email: {
      immutable: true,
      type: String,
    },
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
