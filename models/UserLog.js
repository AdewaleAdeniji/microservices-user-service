import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userLogSchema = new Schema(
  {
    userID: String,
    action: String,
  },
  {
    timestamps: true,
  }
);
exports.usersLogs = userLogSchema;
module.exports = mongoose.model("usersLogs", userLogSchema);
