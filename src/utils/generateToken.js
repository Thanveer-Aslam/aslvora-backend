import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );
};

export default generateToken;
