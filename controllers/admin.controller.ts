import { DatabaseError } from "../errors/database.error";
import { Issue, ValidationError } from "../errors/validation.error";
import { IAdmin } from "../interfaces/admin.interface";
import { type Request, type Response } from "express";
import { adminSchema } from "../models/admin.model";

export class AdminController {
    private readonly adminRepository: IAdmin;

    constructor(adminRepository: IAdmin) {
        this.adminRepository = adminRepository;
    }

    async Login(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            message: "Login",
        })
    }

    async Register(req: Request, res: Response): Promise<void> {
        try {
            const rawAdmin = req.body;
            const validatedResponseBody = await adminSchema.safeParseAsync(rawAdmin);

            if (validatedResponseBody.success) {
                await this.adminRepository.register(validatedResponseBody.data);

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

    private errorHandler(error: unknown, res: Response): void {
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