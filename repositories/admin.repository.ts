import { Collection } from "mongodb";
import { IAdmin } from "../interfaces/admin.interface";
import { AdminRequest, AdminResponse } from "../models/admin.model";

export class AdminRepository implements IAdmin {
    private readonly _collection: Collection;
    constructor(collection: Collection) {
        if (!collection) {
            throw new SyntaxError("Collection is required");
        }

        this._collection = collection;
    }

    public async login(data: AdminRequest): Promise<AdminResponse> {
        throw new Error("Method not implemented.");
    }

    public async register(data: AdminRequest): Promise<void> {
        try {
            await this._collection.insertOne(data);
        } catch (error) {
            throw new Error(`Error registering admin. Reason: ${error}`);
        }
    }
}