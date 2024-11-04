import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { IAuthentication } from "../interfaces/auth.interface";

interface JWTPayload {
    secret: string;
    expiresIn: string;
}

export class AuthService {
    private readonly authenticationService: IAuthentication;

    constructor(authentication: IAuthentication) {
        this.authenticationService = authentication;
    }

    public async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    public async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
        const bearerToken = req.header("authorization");
        console.log(req.header, "<<<")

        if (!bearerToken) {
            res.status(401).json({
                message: "Authorization header is required"
            });

            return;
        }

        if (bearerToken === "") {
            res.status(401).json({
                message: "Authorization header is required"
            });

            return;
        }

        const validated = this.authenticationService.validateAccessToken(bearerToken.replace("Bearer ", ""));

        if (!validated) {
            res.status(401).json({
                message: "Invalid token"
            });

            return;
        }

        next();
    }
}