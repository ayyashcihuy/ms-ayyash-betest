import jwt from "jsonwebtoken";
import { AuthenticationError } from "../errors/authentication.error";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";

interface JWTPayload {
    secret: string;
    expiresIn: string;
}

export class AuthService {
    private readonly config: JWTPayload;

    constructor(config: JWTPayload) {
        this.config = config;
    }

    public async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    public async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    public generateToken(username: string): string {
        try {
            return jwt.sign({ username }, this.config.secret, {
                expiresIn: this.config.expiresIn
            });
        } catch (error) {
            throw new AuthenticationError("Error generating token");
        }
    }

    private verifyToken(token: string): object | string {
        try {
            return jwt.verify(token, this.config.secret);
        } catch (error) {
            throw new AuthenticationError("Invalid token");
        }
    }

    public async authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
        const token = req.cookies.token;

        if (!token) {
            throw new AuthenticationError("Token is required");
        }

        const decodedToken = this.verifyToken(token);

        if (typeof decodedToken === "string") {
            throw new AuthenticationError("Invalid token");
        }

        req.user = decodedToken;
        next();
    }
}