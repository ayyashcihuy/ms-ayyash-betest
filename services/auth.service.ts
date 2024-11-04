import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { IAuthentication } from "../interfaces/auth.interface";

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
        const access_token = req.cookies.access_token;

        if (!access_token) {
            res.status(401).json({
                message: "Authorization header is required"
            }).end();

            return;
        }

        if (access_token === "") {
            res.status(401).json({
                message: "Authorization header is required"
            }).end();

            return;
        }

        const validated = this.authenticationService.validateAccessToken(access_token.replace("access_token ", ""));

        if (!validated) {
            res.status(401).json({
                message: "Invalid token"
            }).end();

            return;
        }

        next();
    }
}