import { Collection, ObjectId } from "mongodb";
import { UserRequest, UserResponse } from "../models/user.model";
import { IUser } from "../interfaces/user.interface";
import { DatabaseError } from "../errors/database.error";

export class UserRepository implements IUser {
    private readonly _collection: Collection;

    constructor(collection: Collection) {
        if (!collection) {
            throw new SyntaxError("Collection is required");
        }

        this._collection = collection;
    }

    public async updateUser(user: Partial<UserResponse>, userId: ObjectId): Promise<void> {
        try {
            await this._collection.updateOne({ _id: userId }, { $set: user });
            return;
        } catch (error) {
            throw new DatabaseError(`Error updating user. Reason: ${error}`);
        }
    }

    public async deleteUser(userId: Object): Promise<void> {
        await this._collection.deleteOne({ _id: userId });
        return;
    }

    public async createUser(user: UserRequest): Promise<void> {
        try {
            await this._collection.insertOne(user);
            return;
        } catch (error) {
            throw new DatabaseError(`Error creating user. Reason: ${error}`);
        }
    }

    public async getAllUsers(page: number, limit: number, accountNumber?: number, identityNumber?: string): Promise<UserResponse[]> {
        const query = new Object();
        if (accountNumber) Object.assign(query, { accountNumber: accountNumber });
        if (identityNumber) Object.assign(query, { identityNumber: identityNumber });
        const paginationContext = this.getPaginationContext(page, limit);
        const rawUsers = await this._collection.find(query).skip(paginationContext.skip).limit(paginationContext.limit).toArray();

        const sanitizedUsers = rawUsers.map((user) => {
            return {
                _id: user._id.toString(),
                userName: user.userName,
                emailAddress: user.emailAddress,
                accountNumber: user.accountNumber,
                identityNumber: user.identityNumber
            }
        });

        return sanitizedUsers;
    }

    private getPaginationContext(page: number, limit: number): { skip: number, limit: number } {
        return {
            skip: page * limit,
            limit: limit
        }
    }
}