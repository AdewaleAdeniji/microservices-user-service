const crypto = require("crypto");
const { config, algorithm } = require("../configs");
const salt = config.API_KEYS_SALT;

function generateKeys(userID) {
  const privateKeyBuffer = deriveKey(userID);
  const privateKey = privateKeyBuffer.toString("base64");
  const publicKey = encrypt(privateKeyBuffer, userID);
  return { privateKey, publicKey };
}

function deriveKey(userID) {
  const derivedKey = crypto.pbkdf2Sync(userID, salt, 100000, 32, "sha256");
  return derivedKey;
}

function encrypt(keyBuffer, data) {
  const cipher = crypto.createCipher(algorithm, keyBuffer);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(privateKey, data) {
  const keyBuffer = Buffer.from(privateKey, "base64");
  const decipher = crypto.createDecipher(algorithm, keyBuffer);
  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt,
  generateKeys,
};
