const hookModel = require("../models/Hooks.js");
const { getDashboardAggregate } = require("../services/hook.js");
const { generateKeys } = require("../utils/apiKeys.js");
const clientModel = require("../models/Clients.js");
const {
  generateID,
  validateRequest,
  createHash,
} = require("../utils/index.js");

exports.getDashboardStats = async (req, res) => {
  try {
    const appOwnerID = req.userID;
    // get the apps belonging to the appOwnerID
    // get the hooks belonging to the apps
    // get the stats for the hooks
    const clients = await clientModel
      .find({ appOwnerID })
      .select("-_id -__v -appOwnerID -appAccessKey");

    const response = await Promise.all(
      clients.map(async (client) => {
        const stats = await hookModel.aggregate(
          getDashboardAggregate(client.appID)
        );
        const stat = {
          appName: client?.appName,
          appDescription: client?.appDescription,
          ...stats[0], // Assuming stats is an array with a single element
        };
        return stat;
      })
    );

    return res.status(200).send({ stats: response });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};
exports.getAppStats = async (req, res) => {
  try {
    const appOwnerID = req.userID;
    // get the apps belonging to the appOwnerID
    // get the hooks belonging to the apps
    // get the stats for the hooks
    const appID = req.params.appID;
    const client = await clientModel
      .findOne({ appOwnerID, appID: appID })
      .select("-_id -__v -appOwnerID -appAccessKey");
    if (!client) return res.status(400).send({ message: "Client not found" });

    const stats = await hookModel.aggregate(
      getDashboardAggregate(client.appID)
    );
    const events = await hookModel
      .find({ appID: client.appID })
      .select("-_id -__v -hookPayload");

    return res.status(200).send({
      stats: stats[0],
      events,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};
