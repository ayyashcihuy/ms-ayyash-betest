import { AdminController } from "../controllers/admin.controller";
import { Router } from "express";

export function AdminRouter(controller: AdminController): Router {
    const router = Router();

    router.post("/login", (req, res) => controller.Login(req, res));
    router.post("/register", (req, res) => controller.Register(req, res));
    router.post("logout", (req, res) => controller.Logout(req, res));

    return router;
}