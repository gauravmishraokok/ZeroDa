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
import AppError from "../../utils/AppError.js";

export const registerUser = async (data) => {
    console.log(`[AUTH SERVICE] Checking for existing user: ${data.email}`);
    const { name, email, password } = data;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
        console.log(`[AUTH SERVICE] User already exists: ${email}`);
        throw new AppError("User already exists", 409, 'USER_EXISTS');
    }

    console.log(`[AUTH SERVICE] Creating new user: ${email}`);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create(
        {
            name,
            email,
            password : hashedPassword
        }
    );

    console.log(`[AUTH SERVICE] User created successfully: ${user._id}`);
    return user;
};

export const loginUser = async (data) => {
    console.log(`[AUTH SERVICE] Attempting login for: ${data.email}`);
    const { email, password } = data;

    const user = await userModel.findOne( { email }).select("+password");
    if(!user){
        console.log(`[AUTH SERVICE] User not found: ${email}`);
        throw new AppError("Invalid credentials", 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(password, user.password);  // Always expects (plainTextPassword, hashedPassword)
    if(!isMatch){
        console.log(`[AUTH SERVICE] Invalid password for: ${email}`);
        throw new AppError("Invalid credentials", 401, 'INVALID_CREDENTIALS');
    }

    console.log(`[AUTH SERVICE] Login successful for: ${email}`);
    const token = jwt.sign(
        { _id : user._id},
        env.JWT_SECRET,
        { expiresIn : "1d"}
    );

    return { user, token };
};