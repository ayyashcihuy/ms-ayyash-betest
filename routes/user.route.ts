import UserController from "../controllers/user.controller";
import { Router } from "express";

export function UserRouter(controller: UserController): Router {
    const router = Router();

    router.get("/", (req, res, next) => controller.GetUsers(req, res, next));
    router.post("/create", (req, res, next) => controller.CreateUser(req, res, next));
    router.put("/update", (req, res, next) => controller.UpdateUser(req, res, next));
    router.delete("/delete", (req, res, next) => controller.DeleteUser(req, res, next));

    return router;
}