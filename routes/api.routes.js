const express = require("express");
const { createUser, loginUser, getUser, updateUser, updatePassword, resetPassword } = require("../controllers/user");

const apiRouter = express.Router();
// user apis
apiRouter.route("/user/register").post(createUser)
apiRouter.route("/user/login").post(loginUser)
apiRouter.route("/user").get(getUser)
apiRouter.route("/user").post(updateUser)
apiRouter.route("/user/password").post(updatePassword)



//admin apis
apiRouter.route("/admin/user/:userID").get(getUser)
apiRouter.route("/admin/user/:userID").post(updateUser)
apiRouter.route("/users/status/:userID").post(updateUser)
apiRouter.route("/users/resetpassword/:userID").post(resetPassword)


const RoutesWithPrivateKeyAccess = [
    {
        path: "/users/resetpassword/:userID",
        method: "POST",
        privateKeyRequired: true,
    },
    {
        path: "/user",
        method: "GET",
        validateBearerToken: true,
    },
    {
        path: "/user",
        method: "POST",
        validateBearerToken: true,
    },
    {
        path: "/user/password",
        method: "POST",
        validateBearerToken: true,
    }      
]
module.exports =  { apiRouter, RoutesWithPrivateKeyAccess };