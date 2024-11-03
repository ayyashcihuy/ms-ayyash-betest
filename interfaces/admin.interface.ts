import { AdminRequest, AdminResponse } from "../models/admin.model";

export interface IAdmin {
    login(data: AdminRequest): Promise<AdminResponse>;
    register(data: AdminRequest): Promise<void>;
}