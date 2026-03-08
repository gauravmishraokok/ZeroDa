/*
    Authentication Controller

    1. Handles user registration and login operations
    2. Exposes controller functions for registering and authenticating users
    3. Manages HTTP request and response handling for auth routes
*/
import { registerUser, loginUser } from "./auth.service.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
    console.log(`[AUTH] Registration attempt for email: ${req.body.email}`);
    const user = await registerUser(req.body);
    console.log(`[AUTH] User registered successfully: ${user._id}`);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data : user
    });
});



export const login = asyncHandler(async (req, res) => {
    console.log(`[AUTH] Login attempt for email: ${req.body.email}`);
    const result = await loginUser(req.body);
    console.log(`[AUTH] User logged in successfully: ${result.user._id}`);

    res.status(200).json({
        success : true,
        message : "User logged in successfully",
        data : result
    });
});