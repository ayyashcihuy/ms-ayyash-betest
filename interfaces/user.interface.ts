import { UserRequest, UserResponse } from "../models/user.model";

export interface IUser {
    getAllUsers(page: number, limit: number): Promise<UserResponse[]>;
    createUser(user: UserRequest): Promise<void>;
}