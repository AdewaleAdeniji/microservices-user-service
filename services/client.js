const clientModel = require("../models/Clients.js");

exports.createClientApp  = async (client) => {
    return await clientModel.create(client);
}
exports.getClientApp = async (appID) => {
    const client = await clientModel.findOne({ appID });
    if (!client) return false;
    return client;
  };