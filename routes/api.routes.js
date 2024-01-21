const express = require("express");
const { verifyAuthToken } = require("../controllers/tokenController");
const { createUser, loginUser, getUser, updateUser } = require("../controllers/user");

const apiRouter = express.Router();
apiRouter.route("/user/register").post(createUser)
apiRouter.route("/user/login").post(loginUser)
apiRouter.route("/users/:userID").get(getUser)
apiRouter.route("/users/:userID").post(updateUser)
apiRouter.route("/users/password/:userID").post(updateUser)

const RoutesWithPrivateKeyAccess = [
    {
        path: "/users/:userID",
        method: "POST",
        privateKeyRequired: true,
    },
    {
        path: "/users/password/:userID",
        method: "POST",
        privateKeyRequired: true,
    }     
]
module.exports =  { apiRouter, RoutesWithPrivateKeyAccess };