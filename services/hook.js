exports.getDashboardAggregate = (appID) => {
  return [
    {
      $match: {
        appID: appID,
      },
    },
    {
      $group: {
        _id: {
          appID: "$appID",
          hookEvent: "$hookEvent",
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.appID",
        hookEventsCount: { $sum: "$count" },
        eventCounts: {
          $push: {
            k: "$_id.hookEvent",
            v: "$count",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        appID: "$_id",
        hookEventsCount: 1,
        eventCounts: {
          $arrayToObject: "$eventCounts",
        },
      },
    },
  ];
};
