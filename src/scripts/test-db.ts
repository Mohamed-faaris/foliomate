import clientPromise, { dbName } from "../lib/db";

async function main() {
    try {
        console.log("Connecting to MongoDB...");
        const client = await clientPromise;
        const db = client.db(dbName);
        console.log(`Connected to database: ${db.databaseName}`);

        const collections = await db.listCollections().toArray();
        console.log(
            "Collections:",
            collections.map((c) => c.name),
        );

        console.log("Connection successful!");
        process.exit(0);
    } catch (error) {
        console.error("Connection failed:", error);
        process.exit(1);
    }
}

void main();
