import { AdminController } from "../controllers/admin.controller";
import { Router } from "express";

export function AdminRouter(controller: AdminController): Router {
    const router = Router();

    router.post("/login", (req, res, next) => controller.Login(req, res, next));
    router.post("/register", (req, res, next) => controller.Register(req, res, next));
    router.post("logout", (req, res, next) => controller.Logout(req, res, next));

    return router;
}