import { IUser } from "../interfaces/user.interface";
import { type Request, type Response } from "express";


export class UserController {
    private readonly userRepository: IUser;

    constructor(userRepository: IUser) {
        this.userRepository = userRepository;
    }

    async GetAllUsers(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            message: "Get all users",
        })
    }

    async CreateUser(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            message: "Create user",
        })
    }
}