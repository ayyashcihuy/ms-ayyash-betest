import { Collection } from "mongodb";
import { IAuthentication, TokenSet } from "../interfaces/auth.interface";
import { AdminRequest } from "../models/admin.model";
import { AuthenticationError } from "../errors/authentication.error";
import { sign, verify } from "jsonwebtoken";
import { EmptyArgumentError } from "../errors/emptyArgument.error";

export class AdminRepository implements IAuthentication {
    private readonly _rsaPrivateKey: string;
    private readonly _rsaPublicKey: string;

    private readonly _collection: Collection;
    constructor(collection: Collection, pubKey: string, privateKey: string) {
        if (!collection) {
            throw new SyntaxError("Collection is required");
        }
        if (!pubKey) {
            throw new SyntaxError("Public key is required");
        }
        if (!privateKey) {
            throw new SyntaxError("Private key is required");
        }

        this._rsaPublicKey = pubKey;
        this._rsaPrivateKey = privateKey;
        this._collection = collection;
    }
    validateRefreshToken(refreshToken: string): boolean {
        try {
            // The documentation stated:
            // Returns the payload decoded if the signature is valid 
            // and optional expiration, audience, or issuer are valid. 
            // If not, it will throw the error.
            //
            // So, we will do a simple try/catch block, ignoring the given error.

            verify(
                refreshToken,
                {
                    key: this._rsaPublicKey,
                    passphrase: "",
                },
                {
                    algorithms: ["RS256"],
                    issuer: "opening-account-pengkinian-data",
                    audience: "panin-sekuritas",
                    subject: "refresh"
                }
            );

            return true;
        } catch {
            return false;
        }
    }
    validateAccessToken(accessToken: string): boolean {
        try {
            // The documentation stated:
            // Returns the payload decoded if the signature is valid 
            // and optional expiration, audience, or issuer are valid. 
            // If not, it will throw the error.
            //
            // So, we will do a simple try/catch block, ignoring the given error.

            verify(
                accessToken,
                {
                    key: this._rsaPublicKey,
                    passphrase: "",
                },
                {
                    algorithms: ["RS256"],
                    issuer: "opening-account-pengkinian-data",
                    audience: "panin-sekuritas",
                    subject: "access"
                }
            );

            return true;
        } catch {
            return false;
        }
    }
    decodeJWT<T>(accessToken: string): Partial<T> {
        if (accessToken === "" || accessToken === undefined || accessToken === null) {
            throw new EmptyArgumentError("accessToken cannot be empty");
        }

        const decodedJWT = verify(
            accessToken,
            {
                key: this._rsaPublicKey,
                passphrase: "",
            },
            {
                complete: true,
                algorithms: ["RS256"],
                issuer: "ayyash-betest",
                subject: "access"
            },
        );

        return decodedJWT.payload as Partial<T>;
    }
    decodeRefreshJWT<T>(refreshToken: string): Partial<T> {
        if (refreshToken === "" || refreshToken === undefined || refreshToken === null) {
            throw new EmptyArgumentError("refreshToken cannot be empty");
        }

        const decodedJWT = verify(
            refreshToken,
            {
                key: this._rsaPublicKey,
                passphrase: "",
            },
            {
                complete: true,
                algorithms: ["RS256"],
                issuer: "ayyash-betest",
                subject: "access"
            },
        );

        return decodedJWT.payload as Partial<T>;
    }

    public async requestToken(data: AdminRequest): Promise<TokenSet> {
        // validate user request body from databases
        const accessToken = sign(
            { username: data.username },
            {
                key: this._rsaPrivateKey,
                passphrase: ""
            },
            {
                algorithm: "RS256",
                expiresIn: "2h",
                notBefore: 0,
                issuer: "ayyash-betest",
                subject: "access"
            }
        )

        const refreshToken = sign(
            { username: data.username },
            {
                key: this._rsaPrivateKey,
                passphrase: ""
            },
            {
                algorithm: "RS256",
                expiresIn: "48h",
                notBefore: 0,
                issuer: "ayyash-betest",
                subject: "refresh"
            }
        )

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
            tokenType: "Bearer",
            expiresIn: 7200 // 2 hours in second
        };
    }

    public async getAdminData(data: AdminRequest): Promise<string> {
        try {
            const user = await this._collection.findOne({ username: data.username });

            if (!user) {
                throw new AuthenticationError("Invalid username or password");
            }

            return user.password;
        } catch (error) {
            throw new Error(`Error getting admin data. Reason: ${error}`);
        }
    }

    public async register(data: AdminRequest): Promise<void> {
        try {
            await this._collection.insertOne(data);
        } catch (error) {
            throw new Error(`Error registering admin. Reason: ${error}`);
        }
    }
}