const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clientSchema = new Schema(
  {
    appID: {
      type: String,
      default: "default",
    },
    appName: String,
    appDescription: String,
    appOwnerID: {
      immutable: true,
      type: String,
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
