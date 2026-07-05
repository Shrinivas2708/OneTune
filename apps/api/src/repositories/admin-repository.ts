import { ObjectId } from "mongodb";
import type { HistoryEntry, TrackMetadata } from "@vibevault/types";
import { getDb } from "../lib/db";
import { listAllUsers, type UserDocument } from "./user-repository";

interface HistoryDocument {
  _id: ObjectId;
  userId: ObjectId;
  track: TrackMetadata;
  playedAt: Date;
  durationPlayedMs?: number;
  deletedAt?: Date | null;
}

function history() {
  return getDb().collection<HistoryDocument>("history");
}

interface UserTopArtistsDocument {
  _id: ObjectId;
  userId: ObjectId;
  artists: Array<{ name: string; playCount: number }>;
  updatedAt: Date;
}

function userTopArtists() {
  return getDb().collection<UserTopArtistsDocument>("user_top_artists");
}

async function topArtistNameByUserId() {
  const rows = await userTopArtists().find({}).toArray();
  return new Map(
    rows.map((row) => [row.userId.toHexString(), row.artists[0]?.name ?? null]),
  );
}

function listenWeight(durationPlayedMs?: number) {
  if (typeof durationPlayedMs === "number" && durationPlayedMs > 0) {
    return Math.max(1, Math.round(durationPlayedMs / 120_000));
  }
  return 1;
}

function aggregateArtistsFromDocs(
  docs: HistoryDocument[],
  limit = 30,
): Array<{ name: string; playCount: number }> {
  const counts = new Map<string, { name: string; playCount: number }>();

  for (const doc of docs) {
    const weight = listenWeight(doc.durationPlayedMs);
    for (const artist of doc.track.artists) {
      const name = artist.name.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const existing = counts.get(key);
      if (existing) {
        existing.playCount += weight;
      } else {
        counts.set(key, { name, playCount: weight });
      }
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, limit);
}

function toHistoryEntry(doc: HistoryDocument): HistoryEntry {
  const entry: HistoryEntry = {
    id: doc._id.toHexString(),
    userId: doc.userId.toHexString(),
    track: doc.track,
    playedAt: doc.playedAt.toISOString(),
  };
  if (typeof doc.durationPlayedMs === "number") {
    entry.durationPlayedMs = doc.durationPlayedMs;
  }
  return entry;
}

async function playStatsByUserId() {
  const rows = await history()
    .aggregate<{
      _id: ObjectId;
      totalPlays: number;
      lastPlayedAt: Date;
    }>([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: "$userId",
          totalPlays: { $sum: 1 },
          lastPlayedAt: { $max: "$playedAt" },
        },
      },
    ])
    .toArray();

  return new Map(
    rows.map((row) => [
      row._id.toHexString(),
      { totalPlays: row.totalPlays, lastPlayedAt: row.lastPlayedAt },
    ]),
  );
}

export async function getAdminOverview() {
  const [users, playStats, topArtistsGlobal] = await Promise.all([
    listAllUsers(),
    playStatsByUserId(),
    history()
      .aggregate<{ name: string; playCount: number }>([
        { $match: { deletedAt: null } },
        { $unwind: "$track.artists" },
        {
          $group: {
            _id: { $toLower: "$track.artists.name" },
            name: { $first: "$track.artists.name" },
            playCount: { $sum: 1 },
          },
        },
        { $match: { name: { $nin: [null, ""] } } },
        { $sort: { playCount: -1 } },
        { $limit: 15 },
      ])
      .toArray(),
  ]);

  let totalPlays = 0;
  for (const stat of playStats.values()) {
    totalPlays += stat.totalPlays;
  }

  return {
    totalUsers: users.length,
    usersWithPlays: playStats.size,
    totalPlays,
    topArtistsGlobal: topArtistsGlobal.map((row) => ({
      name: row.name.trim(),
      playCount: row.playCount,
    })),
  };
}

export async function listAdminUserSummaries() {
  const [users, playStats, topArtists] = await Promise.all([
    listAllUsers(),
    playStatsByUserId(),
    topArtistNameByUserId(),
  ]);

  return users
    .map((user: UserDocument) => {
      const id = user._id.toHexString();
      const stats = playStats.get(id);
      return {
        id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt.toISOString(),
        totalPlays: stats?.totalPlays ?? 0,
        lastPlayedAt: stats?.lastPlayedAt?.toISOString() ?? null,
        topArtist: topArtists.get(id) ?? null,
      };
    })
    .sort((a, b) => b.totalPlays - a.totalPlays);
}

export async function getAdminUserDetail(userId: string) {
  if (!ObjectId.isValid(userId)) return null;

  const users = getDb().collection<UserDocument>("users");
  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!user) return null;

  const userObjectId = user._id;
  const [docs, storedTopArtists] = await Promise.all([
    history()
      .find({ userId: userObjectId, deletedAt: null })
      .sort({ playedAt: -1 })
      .limit(2000)
      .toArray(),
    userTopArtists().findOne({ userId: userObjectId }),
  ]);

  const topArtists =
    storedTopArtists?.artists.length
      ? storedTopArtists.artists
      : aggregateArtistsFromDocs(docs);
  const recentHistory = docs.slice(0, 100).map(toHistoryEntry);
  const lastPlayedAt = docs[0]?.playedAt;

  return {
    user: {
      id: user._id.toHexString(),
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    },
    stats: {
      totalPlays: docs.length,
      lastPlayedAt: lastPlayedAt?.toISOString() ?? null,
    },
    topArtists,
    recentHistory,
  };
}
