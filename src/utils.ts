import { User } from "./models/userModle.js";
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";

// Generate JWT token
export const generateToken = (user: User) => {
    return jwt.sign(
        {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET || 'somethingsecret',
        {
            expiresIn: '7d',
        }
    );
}

// Authentication middleware (isAuth)
export const isAuth = (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    
    // Check if Authorization header exists
    if (authorization) {
        const token = authorization.slice(7, authorization.length); // Bearer xxx
        try {
            // Verify token
            const decode = jwt.verify(
                token,
                process.env.JWT_SECRET || 'somethingsecret'
            );
            
            // Attach decoded user info to the request body
            req.body.user = decode as {
                _id: string;
                name: string;
                email: string;
                isAdmin: boolean;
                token: string;
            };
            
            next(); // Proceed to the next middleware
        } catch (err) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please log in again.'
            });
        }
    } else {
        res.status(401).json({
            success: false,
            message: 'No token provided. Please log in.'
        });
    }
}

// Admin authorization middleware (isAdmin)
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore: Handle case where TypeScript doesn't recognize the user on req.body
    if (req.body.user && req.body.user.isAdmin) {
        next(); // User is admin, proceed
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
}

/*export const isAuth = (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (authorization) {
        const token = authorization.slice(7, authorization.length); // Bearer xxx
        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET || 'somethingsecret'
        );
        req.body.user = decode as {
            _id: string;
            name: string;
            email: string;
            isAdmin: boolean;
            token: string;
        };
        next();
    } else {
        res.status(401).json({ message: 'No Token' });
    }
};*/

