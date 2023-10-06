const { verifyToken } = require("../utils");

const validateToken = async (req, res, next) => {
  const headers = req.headers;
  const authorization = headers.authorization;
  const appKey = headers.appkey;
  if (!appKey) {
    return res.status(403).send({ message: "No app key" });
  }
  if (!authorization) {
    return res.status(403).send({ message: "Forbidden access, login first" });
  }
  //validate the token itself
  const val = await verifyToken(authorization.split(" ")[1], appKey);
  if (!val) {
    return res.status(403).send({ message: "Access expired, login first" });
  }
  console.log(req.originalUrl, appKey)
  
  req.userID = val.payload.userID;
  req.user = val.payload;
  req.appID = appKey;

  next();
};

const validateAppKey = async (req, res, next) => {
  const headers = req.headers;
  const appKey = headers.appkey;
  if (!appKey) {
    return res.status(403).send({ message: "No app key" });
  }
  console.log(req.originalUrl, appKey)
  req.appID = appKey;
  next();
};

module.exports  = {
    validateToken,
    validateAppKey,
}