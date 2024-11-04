import { expect, beforeAll, afterAll, describe, it } from "vitest";
import { Database } from "../../config/database";
import { UserRepository } from "../../repositories/user.repository";
import { IUser } from "../../interfaces/user.interface";
import { userSchema } from "../../models/user.model";

describe("UserRepository Tests", () => {
    const mongodUri = "mongodb://localhost:27017";
    const dbName = "user_test_db";
    const userCollectionName = "user_test";
    
    const database = new Database(mongodUri, dbName);
    let userRepository: IUser;
    
    beforeAll(async () => {
        // Connect to the database before running tests
        await database.connect();
        const userCollection = await database.getCollection(userCollectionName, { accountNumber: 1, identityNumber: 1 });
        userRepository = new UserRepository(userCollection);
        
        const dataTest = {
            userName: "budisukabapak",
            accountNumber: 3123412345,
            emailAddress: "admin@example.com",
            identityNumber: "3174041303123458"
        }

        const validatedData = userSchema.safeParse(dataTest);

        if (validatedData.success) {
            // Insert a test user
            await userRepository.createUser(
                {
                    userName: "budisukabapak",
                    accountNumber: 3123412345,
                    emailAddress: "admin@example.com",
                    identityNumber: "3174041303123458"
                }
            );
        }

    });
    
    afterAll(async () => {
        // Disconnect and clean up after all tests have run
        const userCollection = await database.getCollection(userCollectionName, { accountNumber: 1, identityNumber: 1 });
        await userCollection.drop(); // Clean up collection
        await database.disconnect();
    });
    
    it("Should get all case registered user", async () => {
        const page = 1;
        const limit = 10;
        const accountNumber = 3123412345;
        const identityNumber = "3174041303123458";

        // Retrieve all users
        const users = await userRepository.getAllUsers(page, limit);
        expect(users).toBeDefined();
        expect(users.length).toBeGreaterThan(0);
        expect(users[0].userName).toStrictEqual("budisukabapak");
        expect(users[0].accountNumber).toStrictEqual(3123412345);
        expect(users[0].emailAddress).toStrictEqual("admin@example.com");
        expect(users[0].identityNumber).toStrictEqual("3174041303123458");
    
        // Retrieve filtered users
        const filteredUser = await userRepository.getAllUsers(page, limit, accountNumber, identityNumber);
        expect(filteredUser).toBeDefined();
        expect(filteredUser.length).toBeGreaterThan(0);
        expect(filteredUser[0].userName).toStrictEqual("budisukabapak");
        expect(filteredUser[0].accountNumber).toStrictEqual(3123412345);
        expect(filteredUser[0].emailAddress).toStrictEqual("admin@example.com");
        expect(filteredUser[0].identityNumber).toStrictEqual("3174041303123458");
    });
});

