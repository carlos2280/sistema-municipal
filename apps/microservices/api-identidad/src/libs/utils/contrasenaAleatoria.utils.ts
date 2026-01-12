import crypto from "node:crypto";

export const generateRandomPassword = (length = 12) => {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
};
