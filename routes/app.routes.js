const express = require("express");
const { verifyAuthToken } = require("../controllers/tokenController");
const { createClient, getAllUserClients, getClientByAppID, updateClientByAppID } = require("../controllers/clientController");
const { getClientUsers } = require("../controllers/user");
const { getDashboardStats, getAppStats } = require("../controllers/statController");

const appRouter = express.Router();
appRouter.route("/").get(verifyAuthToken);
appRouter.route("/apps").post(createClient);
appRouter.route("/apps").get(getAllUserClients);
appRouter.route("/details/:appID").get(getClientByAppID);
appRouter.route("/details/:appID").put(updateClientByAppID);
appRouter.route("/users/:appID").get(getClientUsers);

//stats
appRouter.route("/stats").get(getDashboardStats);
appRouter.route("/stat/:appID").get(getAppStats);

module.exports = appRouter;