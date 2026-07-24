import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.refreshTokenSecret);
};

export default verifyRefreshToken;
