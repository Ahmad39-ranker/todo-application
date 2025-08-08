// todo-service/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Extend the Request interface to include the user property
// This allows us to attach user information (like uuid) to the request after authentication
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string; // The user's UUID from the JWT payload
            };
        }
    }
}

// Define your JWT secret key. IMPORTANT: This MUST match the JWT_SECRET in your User Service!
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Ensure this matches your .env

/**
 * @description Middleware to authenticate requests using JWT.
 * It checks for a token in the Authorization header, verifies it,
 * and attaches the user's ID to the request object.
 */
const auth = (req: Request, res: Response, next: NextFunction) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        // Return 401 Unauthorized if token is missing
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        // The 'jwt.verify' method decodes the token using the secret key.
        // The decoded payload should contain the 'user' object with 'id'.
        const decoded = jwt.verify(token, JWT_SECRET) as { user: { id: string } };

        // Attach the user's ID from the token payload to the request object.
        // This makes the user's ID available in subsequent route handlers.
        req.user = decoded.user;
        next(); // Proceed to the next middleware/route handler
    } catch (error: any) {
        console.error('JWT verification error:', error.message);
        // Return 401 Unauthorized if token is invalid or expired
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export default auth;
