import { expect, beforeAll, afterAll, describe, it } from "vitest";
import { AuthRepository } from "../../repositories/auth.repository";
import { Database } from "../../config/database";
import { IAuthentication } from "../../interfaces/auth.interface";
import fs from "fs";


describe("AuthRepository Tests", () => {
    const mongodUri = "mongodb://localhost:27017";
    const dbName = "test_db";
    const adminCollectionName = "admin_test";
    
    const database = new Database(mongodUri, dbName);
    const publicKey = fs.readFileSync("test_pub_key.pem", "utf8");
    const privateKey = fs.readFileSync("test_private_key.pem", "utf8");
    let authRepository: IAuthentication;
    
    beforeAll(async () => {
        await database.connect();
        const adminCollection = await database.getCollection(adminCollectionName, { username: 1 });
        authRepository = new AuthRepository(adminCollection, publicKey, privateKey);
    
        // Register a test admin for both tests
        await authRepository.register({
            username: "admin",
            password: "admin",
        });
    });
    
    afterAll(async () => {
        const adminCollection = await database.getCollection(adminCollectionName, { username: 1 });
        await adminCollection.drop(); // Clean up the test collection
        await database.disconnect();
    });
    
    it("Should get a registered admin", async () => {
        const adminData = await authRepository.getAdminData({
            username: "admin",
            password: "admin",
        });

        expect(adminData).toBeDefined();
        expect(typeof adminData).toBe("string");
        expect(adminData.length).toBeGreaterThan(0);
    });

    it("Should get token from admin request", async () => {
        const accessToken = await authRepository.requestToken({
            username: "admin",
            password: "admin",
        });

        expect(accessToken).toBeDefined();
        expect(accessToken).toHaveProperty("accessToken");
        expect(accessToken.accessToken.length).toBeGreaterThan(0);
        expect(accessToken).toHaveProperty("refreshToken");
        expect(accessToken.refreshToken.length).toBeGreaterThan(0);
        expect(accessToken).toHaveProperty("expiresIn");
        expect(accessToken.expiresIn).toBeGreaterThan(0);
        expect(accessToken).toHaveProperty("tokenType");
        expect(accessToken.tokenType).toBe("Bearer");
    });
});
