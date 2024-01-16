const UserService = require("../services/user");
const { generateKeys } = require("../utils/apiKeys");
const {
  validateRequest,
  isValidEmail,
  generateID,
  createHash,
  validateHash,
  signToken,
  PasswordValidator,
} = require("../utils/index");
const { HandleEventNotification } = require("./eventController");

exports.createUser = async (req, res) => {
  try {
    /// here
    const body = req?.body;
    const isApiRequest = req?.isApiRequest;
    const client = req?.apiClient;

    const val = validateRequest(body, ["email", "password"]);
    if (val)
      return res.status(400).send({
        message: val,
      });
    const checkEmail = isValidEmail(body.email);
    if (!checkEmail)
      return res.status(400).send({ message: "Invalid email address" });

    const hasRegistered = await UserService.getUserByEmail(
      body.email,
      req.appID
    );

    if (hasRegistered)
      return res.status(400).send({ message: "Email already registered" });

    // create user
    body.userID = generateID();
    if (body.password) {
      if (isApiRequest) {
        const passwordValidator = client?.appSettings?.passwordVerifier;
        if (passwordValidator) {
          const { isValid, message } = await PasswordValidator(
            body.password,
            passwordValidator
          );
          if (!isValid) return res.status(400).send({ message });
        }
      }
      body.password = await createHash(body.password);
      body.hasPassword = true;
    }
    body.appID = req.appID;
    const createUser = await UserService.createUser(body);
    if (!createUser)
      return res.status(400).send({ message: "User account creation failed " });
    const response = {
      firstName: createUser.firstName,
      lastName: createUser.lastName,
      email: createUser.email,
      userID: createUser.userID,
      message: "Registration successful",
    };
    if (isApiRequest) {
      await HandleEventNotification("user-registered", client, response);
    }
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};
exports.loginUser = async (req, res) => {
  try {
    const body = req.body;

    const isApiRequest = req?.isApiRequest;
    const client = req?.apiClient;

    const val = validateRequest(body, ["email", "password"]);
    if (val) return res.status(400).send({ message: val });

    //all good
    const checkEmail = isValidEmail(body.email);
    if (!checkEmail)
      return res.status(400).send({ message: "Invalid email address" });

    // fetch the user
    // compare the password
    const user = await UserService.getUserByEmail(body.email, req.appID);

    if (!user)
      return res.status(400).send({ message: "Incorrect email or password" });

    const hashedPassword = user.password;
    const plainPassword = body.password;

    const isValidPassword = await validateHash(hashedPassword, plainPassword);

    if (!isValidPassword)
      return res.status(400).send({ message: "Incorrect email or password" });
    //here, all is good
    // generate token

    const response = {
      firstName: user.firstName,
      lastName: user.lastName,
      userID: user.userID,
      message: "login successful",
    };
    if (isApiRequest) {
      await HandleEventNotification("user-loggedin", client, response);
    }
    const token = await signToken(response, req.appID);
    response.token = token;
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res.send(500);
  }
};
exports.getUser = async (req, res) => {
  const userID = req.params.userID;
  try {
    const user = await UserService.getUserByUserID(userID, req.appID);
    if (!user) return res.status(400).send({ message: "User not found " });
    user.password = undefined;
    return res.status(200).send(user);
  } catch (err) {
    // console.log(err);
    return res.send(500);
  }
};
exports.updateUser = async (req, res) => {
  const userID = req.params.userID;
  try {
    const user = await UserService.getUserByUserID(userID, req.appID);
    if (!user) return res.status(400).send({ message: "User not found " });

    const update = req.body;
    // if password is in update, remove it from the object
    if (update.password) {
      delete update.password;
    }
    const updateUser = await UserService.updateUser(user.id, {
      ...update,
    });
    if (updateUser)
      return res.status(200).send({
        message: "Update successful",
        success: true,
        ...update,
      });
    return res.status(400).send({
      message: "Update failed",
      success: false,
    });
  } catch (err) {
    // console.log(err);
    return res.send(500);
  }
};
exports.getUserByID = async (userID, appID) => {
  const user = await UserService.getUserByUserID(userID, appID);
  if (!user) return false;
  return user;
};
exports.createUserAPIKey = async (req, res) => {
  const userID = req.params.userID;
  try {
    const user = await UserService.getUserByUserID(userID, req.appID);
    if (!user) return res.status(400).send({ message: "User not found " });
    const keys = await generateKeys(req.params.userID);
    return res.status(200).send(keys);
  } catch (err) {
    console.log(err);
    return res.send(500);
  }
};
// update user
// make user an api user
