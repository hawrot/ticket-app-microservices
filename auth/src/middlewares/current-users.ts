import {Request, Response, NextFunction} from "express";
import jwt from 'jsonwebtoken';

interface UserPayload {
    id: string;
    email: string;
}

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
    if(!req.session?.jwt){
        return next();
    }

    try {
        const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
        res.currentUser = payload;

    }
    catch (e) {

    }
    next();

};