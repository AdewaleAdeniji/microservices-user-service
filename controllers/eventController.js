const request = require("axios");
const hookLogModel = require("../models/Hooks.js");

exports.HandleEventNotification = async (event, client, payload) => {
  await createHookLog(event, client, payload);
  if (
    client &&
    client?.appSettings?.eventNotifications?.enabled &&
    client?.appSettings?.eventNotifications?.webhookURL
  ) {
    
    request({
      url: client?.appSettings?.eventNotifications?.webhookURL,
      method: "post",
      headers: {
        appName: "genelyst",
      },
      data: JSON.stringify({
        ...payload,
        event,
      }),
    })
      .then((message) => {
        console.log('webhook event '+event+' sent');
      })
      .catch((err) => console.log("error webhook send"));
  }
};
const createHookLog = async (event, client, payload) => {
  const hookLog = {
    hookEvent: event,
    appID: client?.appID,
    hookPayload: payload,
    hookURL: client?.appSettings?.eventNotifications?.webhookURL || ""
  };
  await hookLogModel.create(hookLog);
}