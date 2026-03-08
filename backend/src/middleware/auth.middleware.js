/*
    Authentication Middleware

    1. Handles authentication and authorization for protected routes
    2. Utilizes jsonwebtoken for token verification
    3. Exports middleware function for authentication
*/
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from header

    if(!token){
        throw new AppError("Unauthorized", 401, "NO_TOKEN");
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // Attach user data to request

    next();
});