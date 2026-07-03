import { MongoClient, type Db } from "mongodb";
import { env } from "@vibevault/config/server";
import { logger } from "./logger";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDb(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  db = client.db();

  await ensureIndexes(db);

  logger.info({ uri: env.MONGODB_URI.replace(/\/\/.*@/, "//***@") }, "mongodb connected");

  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database not connected. Call connectDb() first.");
  }
  return db;
}

export async function disconnectDb(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

async function ensureIndexes(database: Db): Promise<void> {
  await database.collection("users").createIndex({ email: 1 }, { unique: true });
  await database
    .collection("refreshSessions")
    .createIndex({ jti: 1 }, { unique: true });
  await database
    .collection("refreshSessions")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await database
    .collection("playlists")
    .createIndex({ userId: 1, updatedAt: -1 });
  await database
    .collection("playlists")
    .createIndex({ userId: 1, sourceUrl: 1 }, { unique: true });
  await database
    .collection("favorites")
    .createIndex({ userId: 1, providerId: 1, externalId: 1 }, { unique: true });
  await database
    .collection("favorites")
    .createIndex({ userId: 1, createdAt: -1 });
  const history = database.collection("history");
  const historyIndexName = "userId_1_playedAt_-1";
  const historyIndexSpec = { userId: 1, playedAt: -1 } as const;
  const historyIndexOptions = {
    name: historyIndexName,
    partialFilterExpression: { deletedAt: null },
  };
  // Atlas partial indexes do not support `{ deletedAt: { $exists: false } }`.
  await history.updateMany(
    { deletedAt: { $exists: false } },
    { $set: { deletedAt: null } },
  );
  const existingHistoryIndex = (await history.indexes()).find(
    (index) => index.name === historyIndexName,
  );
  const hasCorrectPartialIndex =
    existingHistoryIndex?.partialFilterExpression?.deletedAt === null;
  if (existingHistoryIndex && !hasCorrectPartialIndex) {
    await history.dropIndex(historyIndexName);
  }
  if (!hasCorrectPartialIndex) {
    await history.createIndex(historyIndexSpec, historyIndexOptions);
  }
  await database
    .collection("user_top_artists")
    .createIndex({ userId: 1 }, { unique: true });
}
