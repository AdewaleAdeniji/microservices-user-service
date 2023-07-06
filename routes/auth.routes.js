const express = require("express");
const { verifyAuthToken } = require("../controllers/tokenController");

const tokenRouter = express.Router();
tokenRouter.route("/").get(verifyAuthToken);
module.exports = tokenRouter;
