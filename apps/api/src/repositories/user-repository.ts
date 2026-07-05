import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../lib/db";

export interface UserDocument {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: Date;
  isAdmin?: boolean;
}

export interface RefreshSessionDocument {
  _id: ObjectId;
  userId: ObjectId;
  jti: string;
  expiresAt: Date;
  createdAt: Date;
}

function users(): Collection<UserDocument> {
  return getDb().collection<UserDocument>("users");
}

function refreshSessions(): Collection<RefreshSessionDocument> {
  return getDb().collection<RefreshSessionDocument>("refreshSessions");
}

export async function findUserByEmail(
  email: string,
): Promise<UserDocument | null> {
  return users().findOne({ email: email.toLowerCase() });
}

export async function findUserById(
  id: string,
): Promise<UserDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  return users().findOne({ _id: new ObjectId(id) });
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  displayName: string;
}): Promise<UserDocument> {
  const doc: Omit<UserDocument, "_id"> = {
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    displayName: input.displayName,
    createdAt: new Date(),
  };

  const result = await users().insertOne(doc as UserDocument);
  return { _id: result.insertedId, ...doc };
}

export async function createRefreshSession(input: {
  userId: string;
  jti: string;
  expiresAt: Date;
}): Promise<void> {
  await refreshSessions().insertOne({
    _id: new ObjectId(),
    userId: new ObjectId(input.userId),
    jti: input.jti,
    expiresAt: input.expiresAt,
    createdAt: new Date(),
  });
}

export async function findRefreshSession(
  jti: string,
): Promise<RefreshSessionDocument | null> {
  return refreshSessions().findOne({ jti });
}

export async function deleteRefreshSession(jti: string): Promise<void> {
  await refreshSessions().deleteOne({ jti });
}

export function toPublicUser(user: UserDocument) {
  return {
    id: user._id.toHexString(),
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function listAllUsers(): Promise<UserDocument[]> {
  return users().find({}).sort({ createdAt: -1 }).toArray();
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  if (!ObjectId.isValid(userId)) return false;
  const user = await users().findOne(
    { _id: new ObjectId(userId) },
    { projection: { isAdmin: 1 } },
  );
  return user?.isAdmin === true;
}
