/*
    Async Handler Utility

    Wraps async controller functions to automatically catch errors and pass them to the next middleware.
    Eliminates the need for try/catch blocks in controllers.
*/

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default asyncHandler;