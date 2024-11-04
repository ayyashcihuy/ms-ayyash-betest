import { createClient } from "redis";
import { RedisError } from "../errors/redis.error";

export class RedisClient {
    private readonly client: ReturnType<typeof createClient>;
    constructor(redisUrl: string) {
        this.client = createClient({
            url: redisUrl
        });
        // Handle connection events
        this.client.on("connect", () => {
            console.log("Connected to Redis");
        });

        this.client.on("error", (err) => {
            console.error("Redis Client Error", err);
        });

    }

    public async connect() {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }

    public async setCache(key: string, value: string, expiration: 3600) {
        try {
            await this.client.set(key, value, {
                EX: expiration
            });
        } catch (error) {
            throw new RedisError(`Error setting cache. Reason: ${error}`);
        }
    }

    public async getCache(key: string): Promise<string> {
        try {
            const data = await this.client.get(key);

            return data ? data : "";
        } catch (error) {
            throw new RedisError(`Error getting cache. Reason: ${error}`);
        }
    }

    public async deleteCache(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            throw new RedisError(`Error deleting cache. Reason: ${error}`);
        }
    }
}