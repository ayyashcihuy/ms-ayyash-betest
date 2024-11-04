import { DatabaseError } from "../errors/database.error";
import { Issue, ValidationError } from "../errors/validation.error";
import { IAuthentication } from "../interfaces/auth.interface";
import { NextFunction, type Request, type Response } from "express";
import { adminSchema } from "../models/admin.model";
import { AuthService } from "../services/auth.service";
import { AuthenticationError } from "../errors/authentication.error";

export class AdminController {
    private readonly adminRepository: IAuthentication;
    private readonly auth: AuthService;

    constructor(adminRepository: IAuthentication, auth: AuthService) {
        this.adminRepository = adminRepository;
        this.auth = auth;
    }

    async Login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const rawBody = req.body;
            const validatedResponseBody = await adminSchema.safeParseAsync(rawBody);

            if (validatedResponseBody.success) {
                const userPassword = await this.adminRepository.getAdminData(validatedResponseBody.data);
                const isValidated = await this.auth.comparePassword(validatedResponseBody.data.password, userPassword);

                if (!isValidated) {
                    throw new AuthenticationError("Invalid password");
                }

                const tokenSet = await this.adminRepository.requestToken(validatedResponseBody.data);

                const expiresAt = new Date()
                expiresAt.setHours(expiresAt.getHours() + 48);

                res.setHeader("Content-Type", "application/json");
                res.setHeader("Set-Cookie", `accessToken=${tokenSet.accessToken}; Max-Age=${60 * 60 * 48}; Expires=${expiresAt.toUTCString()}; httpOnly; secure; sameSite=strict`);
                res.status(200).json(tokenSet);
            } else {
                const issues: Issue[] = [];

                validatedResponseBody.error.issues.forEach((issue) => {
                    issues.push({
                        field: issue.code,
                        reason: issue.message
                    });
                })

                throw new ValidationError(issues);
            }

            next();
        } catch (error) {
            next(error);
        }
    }

    async Register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const rawAdmin = req.body;
            const validatedResponseBody = await adminSchema.safeParseAsync(rawAdmin);

            if (validatedResponseBody.success) {
                await this.adminRepository.register({
                    username: validatedResponseBody.data.username,
                    password: await this.auth.hashPassword(validatedResponseBody.data.password)
                });

                res.status(200).json({
                    message: "Registered",
                })

                return;
            } else {
                const issues: Issue[] = [];

                validatedResponseBody.error.issues.forEach((issue) => {
                    issues.push({
                        field: issue.code,
                        reason: issue.message
                    });
                })

                throw new ValidationError(issues);
            }
        } catch (error) {
            next(error);
        }
    }

    async Logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Set-Cookie", "pans_pengkinian=; HttpOnly; SameSite=Strict; Path=/;");
            res.status(204).json({
                message: "Logout success"
            });
            next();
        } catch (error) {
            next(error);
        }
    }

    private errorHandler(error: unknown, res: Response): void {
        if (error instanceof AuthenticationError) {
            res.status(401).json({
                message: "Authentication error",
                error: error.message,
            })

            return;
        }

        if (error instanceof DatabaseError) {
            res.status(500).json({
                message: "Database error",
                error: error.message,
            })

            return;
        }

        if (error instanceof SyntaxError) {
            res.status(400).json({
                message: "Invalid user request",
                error: error.message,
            })

            return;
        }

        if (error instanceof ValidationError) {
            res.status(400).json({
                message: "Invalid user request body",
                error: error.issues,
            })

            return;
        }

        throw error;
    }
}