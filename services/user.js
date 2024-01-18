// fetch user by email
// fetch user by userID
// create user
// update user

const UserModel = require("../models/User");

exports.createUser = async (user) => {
  return await UserModel.create(user);
};
exports.getUserByUserID = async (userID, appID, options = "") => {
  return await UserModel.findOne({
    userID,
    appID,
  }).select(options);
};
exports.getUserByEmail = async (email, appID) => {
  return await UserModel.findOne({
    email,
    appID,
  });
};

exports.getClientUsers = async (appID, options) => {
  return await UserModel.find({
    appID,
  }).select(options);
};

exports.updateUser = async (id, user) => {
  return await UserModel.findByIdAndUpdate(id, user);
};
