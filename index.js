const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { createHash, generateOTP } = require("./utils");
require("dotenv").config();
const cors = require("cors");
var bodyParser = require("body-parser");
const userRouter = require("./routes/user.routes");
const tokenRouter = require("./routes/auth.routes");
const { validateToken } = require("./middlewares");

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use("/auth", userRouter);
app.use("/token", validateToken, tokenRouter);

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
