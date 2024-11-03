import "dotenv/config";
import express from "express";
import { Database } from "./config/database";
import { UserRouter } from "./routes/user.route";
import { UserRepository } from "./repositories/user.repository";
import UserController from "./controllers/user.controller";
import { AdminController } from "./controllers/admin.controller";
import { AdminRepository } from "./repositories/admin.repository";
import { AuthService } from "./services/auth.service";
import { AdminRouter } from "./routes/admin.route";

const mongodUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "mydb";
const port = process.env.PORT || 3000;
const userCollectionName = process.env.COLLECTION_NAME || "users";
const adminCollectionName = process.env.COLLECTION_NAME || "admins";
const secret = process.env.SECRET || "secret";
const expiresIn = process.env.EXPIRES_IN || "1h";

const database = new Database(mongodUri, dbName);

(async () => {
  // Connect to database
  await database.connect();
  const auth = new AuthService({ secret, expiresIn });

  // Get collection
  const userCollection = await database.getCollection(userCollectionName, { accountNumber: 1, identityNumber: 1 });
  const adminCollection = await database.getCollection(adminCollectionName, { username: 1 });
  const userRepository = new UserRepository(userCollection);
  const adminRepository = new AdminRepository(adminCollection);
  const userController = new UserController(userRepository);
  const adminController = new AdminController(adminRepository, auth);

  // declare app
  const app = express();

  app.use(express.json());

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "content-type,accept");
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

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();

