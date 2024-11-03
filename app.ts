import "dotenv/config";
import express from "express";
import { Database } from "./config/database";
import { UserRouter } from "./routes/user.route";
import { UserRepository } from "./repositories/user.repository";
import { UserController } from "./controllers/user.controller";

const mongodUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "mydb";
const port = process.env.PORT || 3000;
const userCollectionName = process.env.COLLECTION_NAME || "users";
const adminCollectionName = process.env.COLLECTION_NAME || "admins";

const database = new Database(mongodUri, dbName);

(async () => {
  // Connect to database
  await database.connect();
  
  // Get collection
  const collection = await database.getCollection(userCollectionName);
  const userRepository = new UserRepository(collection);
  const userController = new UserController(userRepository);

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

  app.use("/api/v1/users", UserRouter(userController));
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`); 
  });
})();

