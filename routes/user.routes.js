const express = require("express");
const { createUser, loginUser } = require("../controllers/user");

const userRouter = express.Router()

userRouter.route("/register").post(createUser)
userRouter.route("/login").post(loginUser)

module.exports = userRouter;