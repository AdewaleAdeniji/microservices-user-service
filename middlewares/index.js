const { getUserByID } = require("../controllers/user");
const { getClientApp } = require("../services/client");
const { verifyToken } = require("../utils");
const { decrypt } = require("../utils/apiKeys");

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
const validateAPIKey = async (req, res, next) => {
  const headers = req.headers;
  const privateKey = headers.authprivatekey;
  const publicKey = headers.authpublickey;
  const appKey = headers.appkey;
  // console.log('here', headers);
  if (!privateKey || !publicKey) {
    return res.status(403).send({ message: "Forbidden ACCESS" });
  }
  //validate the token itself
  const val = await decrypt(privateKey, publicKey)
  if (!val) {
    return res.status(403).send({ message: "Invalid API key access" });
  }
  console.log(req.originalUrl, appKey)
  req.userID = val;
  req.user = await getUserByID(val, appKey);
  next();
};

const validateClientAPIKey = async (req, res, next) => {
  const headers = req.headers;
  const privateKey = headers.authprivatekey;
  const publicKey = headers.authpublickey;

  if (!privateKey || !publicKey) {
    return res.status(403).send({ message: "Forbidden ACCESS" });
  }
  //validate the token itself
  const val = await decrypt(privateKey, publicKey)
  if (!val) {
    return res.status(403).send({ message: "Invalid API key access" });
  }
  req.userID = val;
  const client = await getClientApp(val);
  if(!client) return res.status(403).send({ message: "Invalid API key access" });
  req.appID = client.appID;
  client.appSettings = {
    ensureEmailVerification: true,
    eventNotifications: {
      webhookURL: "https://webhook.site/180db206-bc5b-4e94-a8c8-53378740ca19",
      enabled: true,
    },
    passwordVerifier: {
    minLength: 9,
    shouldContainNumber: false,
    shouldContainSpecialCharacters: false,
    shouldContainLowerCase: true,
    shouldContainUpperCase: true,
  }
}
  req.apiClient = client;
  req.isApiRequest = true;
  next();
};

const validateAppKey = async (req, res, next) => {
  const headers = req.headers;
  const appKey = headers.appkey;
  if (!appKey) {
    return res.status(403).send({ message: "No app key" });
  }
  // #TODO validate app key here
  console.log(req.originalUrl, appKey)
  req.appID = appKey;
  next();
};

module.exports  = {
    validateToken,
    validateAppKey,
    validateAPIKey,
    validateClientAPIKey
}