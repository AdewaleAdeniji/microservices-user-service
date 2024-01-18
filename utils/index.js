const jwt = require("jsonwebtoken");
const argon2 = require("argon2");

const createHash = async function (plainTextPassword) {
  // return password hash
  return await argon2.hash(plainTextPassword);
};
const generateID = () => {
  const timestamp = new Date().getTime().toString(); // get current timestamp as string
  const random = Math.random().toString().substr(2, 5); // generate a random string of length 5
  const userId = timestamp + random; // concatenate the timestamp and random strings
  return userId + generateRandomString(10);
};

const getUserObjectFormat  = (user) => {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    metaData: user.metaData,
    hasPassword: user.hasPassword,
    isVerified: user.isVerified,
    userType: user.userType,
    appID: user.appID,
    userID: user.userID,
    email: user.email,
    status: user.status,
    emailVerified: user.emailVerified,
    emailVerificationType: user.emailVerificationType,
    updatedAt: Date.now(),
  }
}
const PasswordValidator = (password, passwordValidator) => {
  var failedVerification = '';
  const { minLength, shouldContainNumber, shouldContainUpperCase, shouldContainLowerCase, shouldContainSpecialCharacters } = passwordValidator;
  if (password.length < minLength) failedVerification = 'Password should be at least '+minLength+' characters long';
  if (shouldContainNumber && !/\d/.test(password)) failedVerification = 'Password should contain at least one number';
  if (shouldContainUpperCase && !/[A-Z]/.test(password)) failedVerification = 'Password should contain at least one uppercase letter';
  if (shouldContainLowerCase && !/[a-z]/.test(password)) failedVerification = 'Password should contain at least one lowercase letter';
  if (shouldContainSpecialCharacters && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) failedVerification = 'Password should contain at least one special character';
  return {
    isValid: failedVerification === '',
    message: failedVerification
  };
}
function isPathInList(path, method, pathList) {
  const matchingPath = pathList.find(entry => {
    const pathRegex = new RegExp('^' + entry.path.replace(/:[^/]+/g, '([^/]+)') + '$');
    return path.match(pathRegex) && entry.method === method;
  });
  return {
    status: !!matchingPath,
    ...matchingPath 
  };
}
// Method to validate the entered password using argon2
const validateHash = async function (hashed, candidatePassword) {
  return await argon2.verify(hashed, candidatePassword);
};
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const signToken = (data, appID) => {
  let jwtSecretKey = process.env.JWT_SECRET_KEY + appID;
  const payload = { payload: data };
  payload.date = Date.now();

  return jwt.sign(payload, jwtSecretKey);
};
const verifyToken = (token, appID) => {
  let jwtSecretKey = process.env.JWT_SECRET_KEY + appID;

  try {
    const verified = jwt.verify(token, jwtSecretKey);
    if (verified) {
      return verified;
    } else {
      // Access Denied
      return false;
    }
  } catch (error) {
    // Access Denied
    return false;
  }
};
const generateOTP = (otpLength = 6) => {
  let digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < otpLength; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};
const WrapHandler = (controllerFn) => {
  return async (req, res, next) => {
    try {
      await controllerFn(req, res, next);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  };
};
const validateRequest = (obj, keys) => {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const words = key.split(/(?=[A-Z])/); // Split the key based on capital letters
    const humanReadableKey = words.join(" "); // Join the words with spaces
    const formattedKey =
      humanReadableKey.charAt(0).toUpperCase() + humanReadableKey.slice(1); // Capitalize the first letter
    if (!(key in obj)) {
      return `${formattedKey} is required`;
    }
    if(key in obj && obj[key] === "") {
      return `${formattedKey} is required`;
    }
  }
  return false;
};
const generateRandomString = (length = 7)  => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let email = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    email += characters.charAt(randomIndex);
  }
  return email;
}
module.exports = {
  verifyToken,
  signToken,
  createHash,
  validateHash,
  isValidEmail,
  generateID,
  generateOTP,
  WrapHandler,
  validateRequest,
  PasswordValidator,
  getUserObjectFormat,
  isPathInList
};
