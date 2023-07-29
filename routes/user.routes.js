const express = require("express");
const { createUser, loginUser, getUser } = require("../controllers/user");

const userRouter = express.Router()

userRouter.route("/register").post(createUser)
userRouter.route("/login").post(loginUser)
userRouter.route("/user/:userID").get(getUser)

module.exports = userRouter;