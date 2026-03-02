/*
    Authentication Service

    1. Handles user registration and login operations
    2. Utilizes bcrypt for password hashing
    3. Utilizes jsonwebtoken for token generation
    4. Exports functions for user registration and login
*/
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel } from "./auth.model.js";
import { env } from "../../config/env.js";

export const registerUser = async (data) => {

    const { name, email, password } = data;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create(
        {
            name,
            email,
            password : hashedPassword
        }
    );

    return user;
};

export const loginUser = async (data) => {
    
    const { email, password } = data;

    const user = await userModel.findOne( { email }).select("+password");
    if(!user){
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);  // Always expects (plainTextPassword, hashedPassword)
    if(!isMatch){
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
        { _id : user._id},
        env.JWT_SECRET,
        { expiresIn : "1d"}
    );

    return { user, token };
};