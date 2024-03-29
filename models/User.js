const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
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
    emailVerified: {
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
    statusMessage: {
      type: String,
      default: "",
    },
    updatedUserData: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
exports.users = userSchema;
module.exports = mongoose.model("users", userSchema);
