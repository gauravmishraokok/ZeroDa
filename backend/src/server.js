/*
    Server Startup

    1. Establishes a connection to MongoDB
    2. Starts the Express application on the specified PORT
    3. Logs a message indicating the server is running
*/
import app from './app.js';
import { connectDB } from './db/db.js';
import { env } from './config/env.js';

const startServer = async () => {
    await connectDB();

    app.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`);
    });
};

startServer();