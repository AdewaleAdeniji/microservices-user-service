const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hookSchema = new Schema(
  {
    hookPayload: {
      type: Object,
      default: {},
    },
    hookEvent: {
      type: String,
      default: "",
    },
    hookURL: {
      type: String,
      default: "",
    },
    appID: {
      type: String,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);
exports.hooks = hookSchema;
module.exports = mongoose.model("hooks", hookSchema);
