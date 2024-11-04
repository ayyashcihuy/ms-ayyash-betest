import { ObjectId } from "mongodb";
import { UserRequest, UserResponse } from "../models/user.model";

export interface IUser {
    getAllUsers(page: number, limit: number, accountNumber?: number, identityNumber?: string): Promise<UserResponse[]>;
    createUser(user: UserRequest): Promise<void>;
    updateUser(user: Partial<UserRequest>, userId: ObjectId): Promise<void>;
    deleteUser(userId: ObjectId): Promise<void>;
}