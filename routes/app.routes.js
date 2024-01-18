const express = require("express");
const { verifyAuthToken } = require("../controllers/tokenController");
const { createClient, getAllUserClients, getClientByAppID } = require("../controllers/clientController");
const { getClientUsers } = require("../controllers/user");

const appRouter = express.Router();
appRouter.route("/").get(verifyAuthToken);
appRouter.route("/apps").post(createClient);
appRouter.route("/apps").get(getAllUserClients);
appRouter.route("/details/:appID").get(getClientByAppID);
appRouter.route("/users/:appID").get(getClientUsers);

module.exports = appRouter;