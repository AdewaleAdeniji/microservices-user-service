const request = require("axios");
exports.HandleEventNotification = (event, client, payload) => {
  console.log(event);
  console.log(
    client?.appSettings?.eventNotifications?.enabled,
    client?.appSettings?.eventNotifications?.webhookURL
  );
  if (
    client &&
    client?.appSettings?.eventNotifications?.enabled &&
    client?.appSettings?.eventNotifications?.webhookURL
  ) {
    console.log("here");
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
        console.log(message);
      })
      .catch((err) => console.log(err));
  }
};
