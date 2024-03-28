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
  getUserObjectFormat,
} = require("../utils/index");
const { HandleEventNotification } = require("./eventController");
const clientModel = require("../models/Clients.js");

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
    const appID = isApiRequest ? req.appAccessKey : req.appID;

    const checkEmail = isValidEmail(body.email);
    if (!checkEmail)
      return res.status(400).send({ message: "Invalid email address" });

    const hasRegistered = await UserService.getUserByEmail(body.email, appID);

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

    body.appID = appID;
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
      await HandleEventNotification("userRegistered", client, response);
    }

    const token = await signToken(response, req.appID, 3600);
    response.token = token;

    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);

  }
};
exports.loginUser = async (req, res) => {
  try {
    const body = req.body;
    console.log('here 1')
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
    const appID = isApiRequest ? req.appAccessKey : req.appID;
    const user = await UserService.getUserByEmail(body.email, appID);

    if (!user)
      return res.status(400).send({ message: "Incorrect email or password." });

    if (!user.status) {
      return res
        .status(400)
        .send({ message: user?.statusMessage || "Account is disabled" });
    }
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
      email: user.email,
      userID: user.userID,
      message: "login successful",
    };
    console.log('here')
    if (isApiRequest) {
      await HandleEventNotification("userLoggedin", client, response);
      console.log('then here')
    }
    console.log('proceeds?')
    console.log(client.appSettings)
    const expiry = 3600000 //client?.appSettings?.tokenExpiry||3600000;
    console.log(expiry)
    const token = await signToken(response, req.appID, expiry);
    response.token = token;
    return res.status(200).send(response);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};
exports.getUser = async (req, res) => {
  const userID = req.params.userID || req.userID;

  const isApiRequest = req?.isApiRequest;
  const client = req?.apiClient;

  const appID = isApiRequest ? req.appAccessKey : req.appID;

  try {
    const selectOptions = "-_id -__v -appAccessKey -password -appID";
    const user = await UserService.getUserByUserID(
      userID,
      appID,
      selectOptions
    );
    if (!user) return res.status(400).send({ message: "User not found " });
    if (isApiRequest) {
      await HandleEventNotification("userProfileRetrieved", client, {
        userID: user.userID,
        email: user.email,
      });
    }

    return res.status(200).send(user);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

exports.updatePassword = async (req, res) => {

  const userID = req.params.userID || req.userID;
  const isApiRequest = req?.isApiRequest;
  const client = req?.apiClient;

  try {
    const update = req.body;
    const val = validateRequest(update, ["oldPassword", "newPassword"]);
    if (val)
      return res.status(400).send({
        message: val,
      });
    const selectOptions = " -__v -appAccessKey -appID";
    const appID = isApiRequest ? req.appAccessKey : req.appID;
    const user = await UserService.getUserByUserID(
      userID,
      appID,
      selectOptions
    );
    if (!user) return res.status(400).send({ message: "User not found " });

    const hashedPassword = user.password;
    const plainPassword = update.oldPassword;

    const isValidPassword = await validateHash(hashedPassword, plainPassword);

    if (!isValidPassword)
      return res.status(400).send({ message: "Incorrect old password" });

    // update the password
    if (isApiRequest) {
      const passwordValidator = client?.appSettings?.passwordVerifier;
      if (passwordValidator) {
        const { isValid, message } = await PasswordValidator(
          update.newPassword,
          passwordValidator
        );
        if (!isValid)
          return res.status(400).send({ message: "New " + message });
      }
    }

    const updateUser = await UserService.updateUser(user.id, {
      password: await createHash(update.newPassword),
    });
    if (updateUser) {
      if (isApiRequest) {
        await HandleEventNotification("userPasswordChanged", client, {
          userID: user.userID,
          email: user.email,
        });
      }
      return res.status(200).send({
        message: "Password update successful",
        success: true,
        ...update,
      });
    }
    return res.status(400).send({
      message: "Update failed",
      success: false,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};
exports.resetPassword = async (req, res) => {
  const userID = req.params.userID || req.userID;
  const isApiRequest = req?.isApiRequest;
  const client = req?.apiClient;

  try {
    const update = req.body;
    const val = validateRequest(update, ["newPassword"]);
    if (val)
      return res.status(400).send({
        message: val,
      });
    const selectOptions = " -__v -appAccessKey -appID";
    const appID = isApiRequest ? req.appAccessKey : req.appID;
    const user = await UserService.getUserByUserID(
      userID,
      appID,
      selectOptions
    );
    if (!user) return res.status(400).send({ message: "User not found " });

    // update the password
    if (isApiRequest) {
      const passwordValidator = client?.appSettings?.passwordVerifier;
      if (passwordValidator) {
        const { isValid, message } = await PasswordValidator(
          update.newPassword,
          passwordValidator
        );
        if (!isValid)
          return res.status(400).send({ message: "New " + message });
      }
    }

    const updateUser = await UserService.updateUser(user.id, {
      password: await createHash(update.newPassword),
    });
    if (updateUser) {
      if (isApiRequest) {
        await HandleEventNotification("userPasswordChanged", client, {
          userID: user.userID,
          email: user.email,
        });
      }
      return res.status(200).send({
        message: "Password update successful",
        success: true,
        ...update,
      });
    }
    return res.status(400).send({
      message: "Update failed",
      success: false,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};
exports.updateUser = async (req, res) => {
  const userID = req.params.userID || req.userID;
  const isApiRequest = req?.isApiRequest;
  const client = req?.apiClient;
  const isStatusUpdate = Boolean(req?.params.status) || false;

  try {
    const selectOptions = " -__v -appAccessKey -password -appID";
    const appID = isApiRequest ? req.appAccessKey : req.appID;
    const user = await UserService.getUserByUserID(
      userID,
      appID,
      selectOptions
    );
    if (!user) return res.status(400).send({ message: "User not found " });
    const update = req.body;
    const updatedUserData = user.updatedUserData || [];

    updatedUserData.push(getUserObjectFormat(user));

    // update.updatedUserData = oldData;
    // if password is in update, remove it from the object
    if (update.password) {
      delete update.password;
    }
    if(!isStatusUpdate){
      if (update.status) {
        delete update.status;
      }
      if (update.statusMessage) {
        delete update.statusMessage;
      }
    }

    const updateUser = await UserService.updateUser(user.id, {
      ...update,
      updatedUserData,
    });
    if (updateUser) {
      if (isApiRequest) {
        await HandleEventNotification("userUpdated", client, {
          ...update,
          userID: user.userID,
          email: user.email,
        });
      }
      return res.status(200).send({
        message: "Update successful",
        success: true,
        ...update,
      });
    }
    return res.status(400).send({
      message: "Update failed",
      success: false,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
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
    return res.sendStatus(500);
  }
};
exports.getClientUsers = async (req, res) => {
  try {
    const appID = req.params.appID;
    const client = await clientModel
      .findOne({ appOwnerID: req.userID, appID: req.params.appID })
      .select("-_id -__v -appOwnerID ");
    if (!client) return res.status(404).send({ message: "Client not found" });
    const selectOptions = " -__v -appAccessKey -password -appID";
    const users = await UserService.getClientUsers(client.appAccessKey, selectOptions);
    return res.status(200).send(users);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};
// update user
// make user an api user
