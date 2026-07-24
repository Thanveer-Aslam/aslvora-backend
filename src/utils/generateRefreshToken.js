import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
    },
    env.refreshTokenSecret,
    {
      expiresIn: env.refreshTokenExpiresIn,
    },
  );
};

export default generateRefreshToken;
