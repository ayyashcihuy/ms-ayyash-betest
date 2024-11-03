import { IAdmin } from "../interfaces/admin.interface";
import { type Request, type Response } from "express";

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
        res.status(200).json({
            message: "Register",
        })
    }
}