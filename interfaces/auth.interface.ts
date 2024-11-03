import { AdminRequest, AdminResponse } from "../models/admin.model";

export type TokenSet = {
    accessToken: string;
    refreshToken: string;
    tokenType: "Bearer";
    expiresIn: number;
}

export interface IAuthentication {
    getAdminData(data: AdminRequest): Promise<string>;
    requestToken(data: AdminRequest): Promise<TokenSet>;
    validateRefreshToken(refreshToken: string): boolean;
    validateAccessToken(accessToken: string): boolean;
    decodeJWT<T>(accessToken: string): Partial<T>;
    decodeRefreshJWT<T>(refreshToken: string): Partial<T>;
    register(data: AdminRequest): Promise<void>;
}