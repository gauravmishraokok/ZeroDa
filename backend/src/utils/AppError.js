/*
    AppError Class

    Centralized error class for controlled error throwing throughout the application.
    Provides consistent error structure with status codes, error codes, and optional details.
*/

class AppError extends Error {
    constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        this.isOperational = true; // Distinguish operational errors from programming errors

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;