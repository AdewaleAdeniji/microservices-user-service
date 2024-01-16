const express = require("express");
const { verifyAuthToken } = require("../controllers/tokenController");
const { createUser, loginUser } = require("../controllers/user");

const apiRouter = express.Router();
apiRouter.route("/user/register").post(createUser)
apiRouter.route("/user/login").post(loginUser)

module.exports = apiRouter;