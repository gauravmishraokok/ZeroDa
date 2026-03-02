/*
    Authentication Middleware

    1. Handles authentication and authorization for protected routes
    2. Utilizes jsonwebtoken for token verification
    3. Exports middleware function for authentication
*/
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authenticate = async (req, res, next) => {
    try{
        const token = req.headers.authorization?.split(" ")[1]; // Extract token from header
        
        if(!token){
            throw new Error("Unauthorized");
        }

        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        
        next();
    }
    catch(error){
        res.status(401).json({
            success : false,
            error : "Unauthorized"
        });
    }
};