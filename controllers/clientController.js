const clientModel = require("../models/Clients.js");
const { generateKeys } = require("../utils/apiKeys.js");
const {
  generateID,
  validateRequest,
  createHash,
} = require("../utils/index.js");

exports.createClient = async (req, res) => {
  try {
    const body = req.body;
    const val = validateRequest(body, ["appName", "appDescription"]);
    if (val) return res.status(400).send({ message: val });
    body.appID = generateID();
    body.appOwnerID = req.userID;
    body.appAccessKey = await generateKeys(body.appID + body.appOwnerID)
      .publicKey;
    const createClient = await clientModel.create(body);
    if (!createClient)
      return res.status(400).send({ message: "App creation failed " });
    const response = {
      name: createClient.appName,
      description: createClient.appDescription,
      appID: createClient.appID,
      message: "App creation successful",
    };
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};
exports.getAllUserClients = async (req, res) => {
  try {
    const appOwnerID = req.userID;
    const clients = await clientModel
      .find({ appOwnerID })
      .select("-_id -__v -appOwnerID -appAccessKey");
    return res.status(200).send(clients);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

exports.getClientByAppID = async (req, res) => {
  try {
    const appOwnerID = req.userID;
    const client = await clientModel
      .findOne({ appOwnerID, appID: req.params.appID })
      .select("-_id -__v -appOwnerID -appAccessKey");
    if (!client) return res.status(400).send({ message: "Client not found" });
    const appKeys = await generateKeys(client.appID);
    return res.status(200).send({
      client,
      appKeys,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

exports.updateClientByAppID = async (req, res) => {
  try {
    const appOwnerID = req.userID;
    const client = await clientModel
      .findOne({ appOwnerID, appID: req.params.appID })
      .select(" -__v -appOwnerID -appAccessKey");
    if (!client) return res.status(400).send({ message: "Client not found" });
    // update appSettings in the clientModel
    const appSettings = req.body;
    const updateClient = await clientModel.findByIdAndUpdate(client._id, {
      appSettings: {
        ...client.appSettings,
        ...appSettings,
      },
    });
    console.log({
      ...client.appSettings,
      ...appSettings,
    });
    if (!updateClient)
      return res.status(400).send({ message: "Update failed" });
    const updatedClient = await clientModel
      .findOne({ appOwnerID, appID: req.params.appID })
      .select("-_id -__v -appOwnerID -appAccessKey");
    return res.status(200).send({
      message: "Update successful",
      appSettings: updatedClient.appSettings,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};
