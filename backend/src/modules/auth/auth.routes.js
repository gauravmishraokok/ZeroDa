/*
    Authentication Routes

    1. Handles user registration and login operations by providing the following routes
    2. /register - Registers a new user
    3. /login - Logs in an existing user
*/
import express from "express";
import { register, login } from './auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

export default router;