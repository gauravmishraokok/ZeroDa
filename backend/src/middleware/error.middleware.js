/*
    Global Error Handling Middleware

    Catches all errors and formats them consistently according to the API response standard.
    Handles different error types: AppError, Mongoose errors, validation errors, etc.
*/

import AppError from '../utils/AppError.js';

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400, 'INVALID_ID');
};

const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${field} - '${value}'. Please use another value!`;
    return new AppError(message, 400, 'DUPLICATE_FIELD');
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400, 'VALIDATION_ERROR', errors);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401, 'TOKEN_EXPIRED');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message,
        error: {
            code: err.errorCode || 'INTERNAL_ERROR',
            details: err.details,
            stack: err.stack
        }
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: {
                code: err.errorCode,
                details: err.details
            }
        });
    } else {
        // Programming or other unknown error: don't leak error details
        console.error('ERROR 💥', err);

        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
            error: {
                code: 'INTERNAL_ERROR'
            }
        });
    }
};

export default (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') error = handleCastErrorDB(error);

    // Mongoose duplicate key
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);

    // Mongoose validation error
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    // JWT errors
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else {
        sendErrorProd(error, res);
    }
};