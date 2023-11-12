const express = require("express");
const { createUser, loginUser, getUser, createUserAPIKey, updateUser } = require("../controllers/user");

const userRouter = express.Router()

userRouter.route("/register").post(createUser)
userRouter.route("/create/api/:userID").get(createUserAPIKey)
userRouter.route("/login").post(loginUser)
userRouter.route("/user/:userID").get(getUser)
userRouter.route("/user/:userID").post(updateUser)

module.exports = userRouter;