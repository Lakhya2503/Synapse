import { log } from "winston";
import User from "../model/user.model.js"
import ApiError from "../utils/ApiError.js"
import jwt from 'jsonwebtoken'

export const verifyAuthUser = async (req, _, next) => {
  try {
    // 1️⃣ Read token from Authorization header
    const authHeader = req.headers.authorization;

    console.log(req);


    console.log('authHeader:', authHeader.accessToken);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access token not provided");
    }

    const accessToken = authHeader.split(" ")[1];

    log('accessToken:', accessToken);

    // 2️⃣ Verify token
    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!decoded?.id) {
      throw new ApiError(401, "Invalid access token");
    }

    // 3️⃣ Fetch user
    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // 4️⃣ Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, error.message || "Unauthorized"));
  }
};
