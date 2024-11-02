import { Collection } from "mongodb";
import { UserRequest, UserResponse } from "../models/user.model";
import { IUser } from "../interfaces/user.interface";

export class UserRepository implements IUser {
    private _collection: Collection;

    constructor(collection: Collection) {
        if (!collection) {
            throw new SyntaxError("Collection is required");
        }

        this._collection = collection;
    }

    public async createUser(user: UserRequest): Promise<void> {
        await this._collection.insertOne(user);
        return;
    }

    public async getAllUsers(page: number, limit: number): Promise<UserResponse[]> {
        const paginationContext = this.getPaginationContext(page, limit);
        const rawUsers = await this._collection.find().skip(paginationContext.skip).limit(paginationContext.limit).toArray();

        const sanitizedUsers = rawUsers.map((user) => {
            return {
                _id: user._id,
                userName: user.userName,
                emailAddress: user.emailAddress,
                accountNumber: user.accountNumber
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