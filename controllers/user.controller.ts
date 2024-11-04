import { IUser } from "../interfaces/user.interface";
import { NextFunction, Request, Response } from "express";
import { UserResponseSchema, userSchema } from "../models/user.model";
import { DatabaseError } from "../errors/database.error";
import { Issue, ValidationError } from "../errors/validation.error";
import { ClientError } from "../errors/client.error";
import { ObjectId } from "mongodb";


class UserController {
    private readonly _userRepository: IUser;

    constructor(userRepository: IUser) {
        this._userRepository = userRepository;
    }

    async DeleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.query;

            if (userId === undefined) {
                throw new ClientError("User id is required");
            }

            if (userId && typeof userId !== "string") {
                throw new ClientError("User id must be a string");
            }

            await this._userRepository.deleteUser(new ObjectId(userId));

            res.status(200).json({
                message: `User ${userId} deleted successfully`,
            })

            return;
        } catch (error) {
            next(error)
        }
    }

    async UpdateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { userId } = req.query
            const rawUser = req.body;
            const validatedResponseBody = await userSchema.partial().safeParseAsync(rawUser);

            if (userId && typeof userId !== "string") {
                throw new ClientError("User id must be a string");
            }

            if (userId === undefined) {
                throw new ClientError("User id is required");
            }

            if (validatedResponseBody.success) {
                await this._userRepository.updateUser(validatedResponseBody.data, new ObjectId(userId));

                res.status(200).json({
                    message: `User ${validatedResponseBody.data.userName} updated successfully`,
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
            next(error)
        }
    }

    async GetUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            let { page, limit, accountNumber, identityNumber } = req.query;

            if (page === undefined) {
                page = "1";
            }

            if (limit === undefined) {
                limit = "10";
            }

            if (identityNumber && typeof identityNumber !== "string") {
                throw new ClientError("Identity number must be a string");
            }

            const result = await this._userRepository.getAllUsers(Number(req.query.page), Number(req.query.limit), Number(accountNumber), identityNumber);
            res.status(200).json({
                message: "Success",
                result
            })
        } catch (error) {
            next(error)
        }
    }

    async CreateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // validate user request body
            const rawUser = req.body;

            const validatedResponseBody = await userSchema.safeParseAsync(rawUser);

            if (validatedResponseBody.success) {
                await this._userRepository.createUser(validatedResponseBody.data);

                res.status(200).json({
                    message: "Created",
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
            next(error)
        }
    }
}

export default UserController;