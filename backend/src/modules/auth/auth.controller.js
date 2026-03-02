/*
    Authentication Controller

    1. Handles user registration and login operations
    2. Exposes controller functions for registering and authenticating users
    3. Manages HTTP request and response handling for auth routes
*/
import { registerUser, loginUser } from "./auth.service.js";

export const register = async (req, res) => {
    try{
        const user = await registerUser(req.body);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data : user
        });
    }
    catch(error){
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};



export const login = async (req, res) => {
    try{
        const result = await loginUser(req.body);

        res.status(200).json({
            success : true,
            message : "User logged in successfully",
            data : result
        })
    }
    catch(error){
        res.status(400).json({
            success : false,
            error : error.message
        });
    }
};