/* 
    Express Application Setup

    1. Initializes Express application instance
    2. Configures global middleware (JSON parsing, CORS, security headers, logging)
    3. Registers authentication routes
    4. Defines a health check endpoint for service monitoring
    5. Exports the configured app for server startup
*/
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running"
    });
});

export default app;