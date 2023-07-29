// fetch user by email
// fetch user by userID
// create user
// update user

const UserModel = require("../models/User");

exports.createUser = async (user) => {
  return await UserModel.create(user);
};
exports.getUserByUserID = async (userID, appID) => {
  return await UserModel.findOne({
    userID,
    appID
  });
};
exports.getUserByEmail = async (email, appID) => {
  return await UserModel.findOne({
    email,
    appID
  });
};

exports.updateUser = async (id, user) => {
  return await UserModel.findByIdAndUpdate(id, user);
};
