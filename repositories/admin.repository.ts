import { IAdmin } from "../interfaces/admin.interface";

export class AdminRepository implements IAdmin {
    public async login(username: string, password: string): Promise<string> {
        return "";
    }

    public async register(username: string, password: string): Promise<void> {
        return;
    }
}