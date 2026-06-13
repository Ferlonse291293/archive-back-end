import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {JWT_SECRET} from "../server.js";



export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
