// fetch user by email
// fetch user by userID
// create user
// update user

const UserModel = require("../models/User");

exports.createUser = async (user) => {
  return await UserModel.create(user);
};
exports.getUserByUserID = async (userID) => {
  return await UserModel.findOne({
    userID,
  });
};
exports.getUserByEmail = async (email) => {
  return await UserModel.findOne({
    email,
  });
};

exports.updateUser = async (id, user) => {
  return await UserModel.findByIdAndUpdate(id, user);
};
