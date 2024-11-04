import { test, expect, beforeAll, afterAll } from "vitest";
import { Database } from "../../config/database";
import { UserRepository } from "../../repositories/user.repository";

const mongodUri = "mongodb://localhost:27017";
const dbName = "test";
const userCollectionName = "user_test"

const database = new Database(mongodUri, dbName);

beforeAll( async () => {
    await database.connect();
    // init first admin register
    const userCollection = await database.getCollection(userCollectionName);
    const userRepository = new UserRepository(userCollection);

    await userRepository.createUser({
        userName: "admin",
        accountNumber: 1234567890,
        emailAddress: "admin@example.com",
        identityNumber: "12345678901112134",
    });
})

test("Should get all case registered user", async () => {
    const userCollection = await database.getCollection(userCollectionName);
    const userRepository = new UserRepository(userCollection);
    const page = 1;
    const limit = 10;
    const accountNumber = 1234567890;
    const identityNumber = "12345678901112134";

    // all users 
    const users = await userRepository.getAllUsers(page, limit);
    expect(users).toBeDefined();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0].userName).toStrictEqual("admin");
    expect(users[0].accountNumber).toStrictEqual(1234567890);
    expect(users[0].emailAddress).toStrictEqual("admin@example.com");
    expect(users[0].identityNumber).toStrictEqual("12345678901112134");

    // filtered users
    const filteredUser = await userRepository.getAllUsers(page, limit, accountNumber, identityNumber);
    expect(filteredUser).toBeDefined();
    expect(filteredUser.length).toBeGreaterThan(0);
    expect(filteredUser[0].userName).toStrictEqual("admin");
    expect(filteredUser[0].accountNumber).toStrictEqual(1234567890);
    expect(filteredUser[0].emailAddress).toStrictEqual("admin@example.com");
    expect(filteredUser[0].identityNumber).toStrictEqual("12345678901112134");
});


afterAll(async () => {
    await database.disconnect();
    const userCollection = await database.getCollection(userCollectionName);

    await userCollection.drop();
});

