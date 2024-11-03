import UserController from "../controllers/user.controller";
import { Router } from "express";

export function UserRouter(controller: UserController): Router {
    const router = Router();

    router.get("/", (req, res) => controller.GetUsers(req, res));
    router.post("/create", (req, res) => controller.CreateUser(req, res));
    router.put("/update", (req, res) => controller.UpdateUser(req, res));
    router.delete("/delete", (req, res) => controller.DeleteUser(req, res));

    return router;
}