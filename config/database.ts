import { MongoClient, Db, Collection } from "mongodb";
import { DatabaseError } from "../errors/database.error";

export class Database {
  private readonly client: MongoClient;
  private db: Db | null = null;

  constructor(private readonly url: string, private readonly dbName: string) {
    this.client = new MongoClient(this.url, {
      maxPoolSize: 10,
      minPoolSize: 5,
      waitQueueTimeoutMS: 1000,
      maxIdleTimeMS: 30000
    });
  }

  // Start Connection to database
  public async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      // Using console log to print the connection string
      console.log(`Connected to database ${this.dbName}`);
    } catch (error) {
      throw new DatabaseError(`Error connecting to database. Reason: ${error}`);
    }
  }

  public async disconnect() {
    await this.client.close();
    console.log(`Disconnected from database ${this.dbName}`);
  }

  public async getCollection(collectionName: string, indexing?: { [key: string]: 1 }): Promise<Collection> {
    try {
      if (!this.db) {
        throw new DatabaseError("Database not connected");
      }

      const collection = this.db.collection(collectionName);
      // TODO: add indexing handle for multiple collection
      // setup index for required search fields
      await collection.createIndex(indexing ? indexing : {}, { unique: true });

      return collection;
    } catch (error) {
      throw new DatabaseError(`Error getting collection ${collectionName}. Reason: ${error}`);
    }
  }
}