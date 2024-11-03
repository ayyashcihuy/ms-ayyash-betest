export interface IAdmin {
    login(username: string, password: string): Promise<string>;
    register(username: string, password: string): Promise<void>;
}