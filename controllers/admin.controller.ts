import { DatabaseError } from "../errors/database.error";
import { Issue, ValidationError } from "../errors/validation.error";
import { IAdmin } from "../interfaces/admin.interface";
import { type Request, type Response } from "express";
import { adminSchema } from "../models/admin.model";
import { AuthService } from "../services/auth.service";
import { AuthenticationError } from "../errors/authentication.error";

export class AdminController {
    private readonly adminRepository: IAdmin;
    private readonly auth: AuthService;

    constructor(adminRepository: IAdmin, auth: AuthService) {
        this.adminRepository = adminRepository;
        this.auth = auth;
    }

    async Login(req: Request, res: Response): Promise<void> {
        try {
            const rawBody = req.body;
            const validatedResponseBody = await adminSchema.safeParseAsync(rawBody);

            if (validatedResponseBody.success) {
                const user = await this.adminRepository.login(validatedResponseBody.data);

                const isValidated = await this.auth.comparePassword(validatedResponseBody.data.password, user.password);

                if (!isValidated) {
                    throw new AuthenticationError("Invalid password");
                }

                const token = this.auth.generateToken(validatedResponseBody.data.username);

                res.cookie("token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
                });

                res.status(200).json({
                    message: "Login",
                })
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
            this.errorHandler(error, res);
        }
    }

    async Register(req: Request, res: Response): Promise<void> {
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
            this.errorHandler(error, res);
        }
    }

    async Logout(req: Request, res: Response): Promise<void> {
        res.clearCookie("token");
        res.status(200).json({
            message: "Logout",
        })
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