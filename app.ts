import "dotenv/config";
import fs from "fs";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { Database } from "./config/database";
import { UserRouter } from "./routes/user.route";
import { UserRepository } from "./repositories/user.repository";
import UserController from "./controllers/user.controller";
import { AdminController } from "./controllers/admin.controller";
import { AuthRepository } from "./repositories/auth.repository";
import { AuthService } from "./services/auth.service";
import { AdminRouter } from "./routes/admin.route";
import { AuthenticationError } from "./errors/authentication.error";
import { DatabaseError } from "./errors/database.error";
import { ValidationError } from "./errors/validation.error";
import { EmptyArgumentError } from "./errors/emptyArgument.error";
import { ClientError } from "./errors/client.error";
import { MongoServerError } from "mongodb";
import { RedisClient } from "./config/redis";

const mongodUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "mydb";
const port = process.env.PORT || 3000;
const userCollectionName = process.env.COLLECTION_NAME || "users";
const adminCollectionName = process.env.COLLECTION_NAME || "admins";
const publicKeyPath = process.env.PATH_TO_PUBLIC_KEY || "";
const privateKeypath = process.env.PATH_TO_PRIVATE_KEY || "";
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const publicKey = fs.readFileSync(publicKeyPath, "utf8");
const privateKey = fs.readFileSync(privateKeypath, "utf8");

const database = new Database(mongodUri, dbName);
const redis = new RedisClient(redisUrl);

(async () => {
  // Connect to database
  await database.connect();
  await redis.connect();

  // Get collection
  const userCollection = await database.getCollection(userCollectionName, { accountNumber: 1, identityNumber: 1 });
  const adminCollection = await database.getCollection(adminCollectionName, { username: 1 });
  const userRepository = new UserRepository(userCollection);
  const adminRepository = new AuthRepository(adminCollection, publicKey, privateKey);
  const auth = new AuthService(adminRepository);
  const userController = new UserController(userRepository, redis);
  const adminController = new AdminController(adminRepository, auth);

  // declare app
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "content-type,accept,set-cookie");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method.toUpperCase() === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("Content-Length", 0);
      res.end();
      return;
    }

    next();
  });

  app.use("/api/v1/admin", AdminRouter(adminController));
  app.use("/api/v1/user", (req, res, next) => auth.authenticate(req, res, next), UserRouter(userController));

  app.use((error: unknown, _: Request, res: Response, next: NextFunction) => {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        message: "Authentication error",
        error: error.message,
      })

      return;
    }

    if (error instanceof AuthenticationError) {
      res.status(401).json({
        message: "Authentication error",
        error: error.message,
      })

      return;
    }

    if (error instanceof EmptyArgumentError) {
      res.status(400).json({
        message: "Invalid argument",
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

    if (error instanceof ClientError) {
      res.status(400).json({
        message: "Invalid Client request",
        error: error.message,
      })

      return;
    }

    if (error instanceof MongoServerError) {
      res.status(500).json({
        message: "MongoDB server error",
        error: error.message,
      })

      return;
    }

    res.status(500).json({
      message: "Internal server error",
      error: error,
    }).end();

    next();
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();

