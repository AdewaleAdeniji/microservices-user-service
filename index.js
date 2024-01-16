const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { createHash, generateOTP } = require("./utils");
require("dotenv").config();
const cors = require("cors");
var bodyParser = require("body-parser");
const userRouter = require("./routes/user.routes");
const tokenRouter = require("./routes/auth.routes");
const { validateToken, validateAppKey, validateAPIKey, validateClientAPIKey } = require("./middlewares");
const appRouter = require("./routes/app.routes");
const apiRouter = require("./routes/api.routes");

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth",validateAppKey,  userRouter);
app.use("/token", validateToken, tokenRouter);
app.use("/key", validateAPIKey, tokenRouter);

app.use("/app", validateToken, appRouter);
app.use("/api", validateClientAPIKey, apiRouter);


app.get("/health", (_, res) => {
  return res.status(200).send("OK");
});


mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.AUTH_DB , 
  })
  .then(() => console.log("connected to mongodb"))
  .catch(() => console.log("error occured connecting to mongodb"));



app.listen(process.env.PORT || 4000, () => {
  console.log("Server is running on port 4000");
});
