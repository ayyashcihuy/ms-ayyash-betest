import { UserController } from "../controllers/user.controller";
import { Router } from "express";

export function UserRouter(controller: UserController): Router {
    const router = Router();

    router.get("/", controller.GetAllUsers);
    router.post("/create", controller.CreateUser);

    return router;
}