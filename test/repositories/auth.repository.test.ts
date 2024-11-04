import { beforeAll, expect, test, afterAll } from "vitest";
import { AuthRepository } from "../../repositories/auth.repository";
import { Database } from "../../config/database";

const mongodUri = "mongodb://localhost:27017";
const dbName = "test_db";

const adminCollectionName = "admin_test";
const database = new Database(mongodUri, dbName);
const publicKey = "public_key";
const privateKey = "private_key";


beforeAll( async () => {
    await database.connect();
    // init first admin register
    const adminCollection = await database.getCollection(adminCollectionName);
    const authRepository = new AuthRepository(adminCollection, publicKey, privateKey);
    await authRepository.register({
        username: "admin",
        password: "admin",
    });
})

test("Should get a registered admin", async () => { 
    const adminCollection = await database.getCollection(adminCollectionName);
    const authRepository = new AuthRepository(adminCollection, publicKey, privateKey);

    const adminData = await authRepository.getAdminData({
        username: "admin",
        password: "admin",
    });

    expect(adminData).toBeDefined();
    // since return only password for comparing, lets check if it is a string
    expect(typeof adminData).toBe("string");
    expect(adminData.length).toBeGreaterThan(0);
})

test("should get token from admin request", async () => {
    const adminCollection = await database.getCollection(adminCollectionName);
    const authRepository = new AuthRepository(adminCollection, publicKey, privateKey);

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
})

afterAll(async () => {
    await database.disconnect();
    const adminCollection = await database.getCollection(adminCollectionName);

    await adminCollection.drop();
})