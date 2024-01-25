const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema(
  {
    appID: {
      type: String,
      default: "default",
    },
    appAccessKey: {
      type: String,
      default: "default",
    },
    appName: String,
    appDescription: String,
    appOwnerID: {
      immutable: true,
      type: String,
    },
    appSettings: {
      type: Object,
      default: {
        eventNotifications: {
          webhookURL: "",
          enabled: false,
        },
        passwordVerifier: {
          minLength: 8,
          shouldContainNumber: true,
          shouldContainSpecialCharacters: true,
          shouldContainLowerCase: true,
          shouldContainUpperCase: true,
        },
      },
    },
    status: {
      default: true,
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);
exports.clients = clientSchema;
module.exports = mongoose.model("clients", clientSchema);
