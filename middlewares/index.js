const { getUserByID } = require("../controllers/user");
const { RoutesWithPrivateKeyAccess } = require("../routes/api.routes");
const { getClientApp } = require("../services/client");
const { verifyToken, isPathInList } = require("../utils");
const { decrypt, generateKeys } = require("../utils/apiKeys");

const validateToken = async (req, res, next) => {
  const { authpublickey, appid, authorization, appkey } = req.headers;

  const appID = appid || appkey;
  if (appid) {
    if(!authpublickey){
      return res.status(403).send({ message: "Forbidden ACCESS" });
    }
  }
  if (!authorization) {
    return res.status(403).send({ message: "Forbidden access, login first" });
  }
  //validate the token itself

  const val = await verifyToken(authorization.split(" ")[1], appID);
  if (!val) {
    return res.status(403).send({ message: "Access expired, login first" });
  }
  console.log(req.originalUrl, appID);
  req.userID = val.payload.userID;
  req.user = val.payload;
  req.appID = appID;
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
  const val = await decrypt(privateKey, publicKey);
  if (!val) {
    return res.status(403).send({ message: "Invalid API key access" });
  }
  console.log(req.originalUrl, appKey);
  req.userID = val;
  req.user = await getUserByID(val, appKey);
  next();
};

const validateClientAPIKey = async (req, res, next) => {
  const { authpublickey, appid, authprivatekey } = req.headers;

  if (!appid || !authpublickey) {
    return res.status(403).send({ message: "Forbidden ACCESS" });
  }

  const { status, validateBearerToken,  privateKeyRequired } = await isPathInList(
    req.path,
    req.method,
    RoutesWithPrivateKeyAccess
  );

  if(status && validateBearerToken){
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(403).send({ message: "Request Forbidden" });
    }
    //validate the token itself
    const val = await verifyToken(authorization.split(" ")[1], appid);
    if (!val) {
      return res.status(403).send({ message: "Access expire, login first" });
    }
    req.userID =  val.payload.userID;
    req.user = val.payload;
    req.params.userID = val.payload.userID;
    console.log(req.params);
  }

  if (status && privateKeyRequired) {
    if (!authprivatekey) {
      return res.status(403).send({ message: "Invalid API keys access" });
    }

    const decryptedAppID = await decrypt(authprivatekey, authpublickey);
    if (!decryptedAppID) {
      return res.status(403).send({ message: "Invalid API key access" });
    }

    const client = await getClientApp(decryptedAppID);

    if (!client) {
      return res.status(403).send({ message: "Invalid API key access" });
    }

    return setClientRequestProperties(req, res, client, next);
  }

  const keys = await generateKeys(appid);
  const { publicKey } = keys;

  if (publicKey !== authpublickey) {
    return res.status(403).send({ message: "Forbidden Request Keys" });
  }

  const client = await getClientApp(appid);

  if (!client) {
    return res.status(403).send({ message: "Invalid API key access" });
  }

  await setClientRequestProperties(req, res, client, next);
};

const setClientRequestProperties = (req, res, client, next) => {
  const { origin } = req.headers;
  console.log('origin ' + origin)
  // const allowedOrigins = client?.allowedOrigins || [];

  // if (!allowedOrigins.includes(origin)) {
  //   return res.status(403).send({ message: "CORS ERROR: Forbidden Origin" });
  // }
  req.appID = client.appID;
  req.isApiRequest = true;
  req.appAccessKey = client.appAccessKey;
  req.userID = req.params.userID;

  client.appSettings = {
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
    },
  };
  req.apiClient = client;
  next();
};

const validateAppKey = async (req, res, next) => {
  const headers = req.headers;
  const appKey = headers.appkey;
  if (!appKey) {
    return res.status(403).send({ message: "No app key" });
  }
  // #TODO validate app key here
  console.log(req.originalUrl, appKey);
  req.appID = appKey;
  next();
};

module.exports = {
  validateToken,
  validateAppKey,
  validateAPIKey,
  validateClientAPIKey,
};
