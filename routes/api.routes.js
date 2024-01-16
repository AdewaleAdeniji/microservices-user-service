const express = require("express");
const { verifyAuthToken } = require("../controllers/tokenController");
const { createUser } = require("../controllers/user");

const apiRouter = express.Router();
apiRouter.route("/user/register").post(createUser)

module.exports = apiRouter;