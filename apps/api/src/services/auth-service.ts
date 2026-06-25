import {
  ERROR_CODES,
  JWT_ACCESS_TOKEN_TTL_SECONDS,
  JWT_REFRESH_TOKEN_TTL_SECONDS,
} from "@vibevault/config";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@vibevault/types";
import { AppError } from "../lib/errors";
import {
  createTokenId,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../lib/jwt";
import { hashPassword, verifyPassword } from "../lib/password";
import {
  createRefreshSession,
  createUser,
  deleteRefreshSession,
  findRefreshSession,
  findUserByEmail,
  findUserById,
  toPublicUser,
} from "../repositories/user-repository";

async function issueTokens(userId: string, email: string) {
  const jti = createTokenId();
  const expiresAt = new Date(Date.now() + JWT_REFRESH_TOKEN_TTL_SECONDS * 1000);

  await createRefreshSession({ userId, jti, expiresAt });

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(userId, email),
    signRefreshToken(userId, jti),
  ]);

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_ACCESS_TOKEN_TTL_SECONDS,
  };
}

function buildAuthResponse(
  user: ReturnType<typeof toPublicUser>,
  tokens: Awaited<ReturnType<typeof issueTokens>>,
): AuthResponse {
  return {
    user: user as User,
    tokens,
  };
}

export async function register(input: RegisterRequest): Promise<AuthResponse> {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new AppError(
      ERROR_CODES.CONFLICT,
      "An account with this email already exists",
      409,
    );
  }

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    email: input.email,
    passwordHash,
    displayName: input.displayName,
  });

  const tokens = await issueTokens(user._id.toHexString(), user.email);
  return buildAuthResponse(toPublicUser(user), tokens);
}

export async function login(input: LoginRequest): Promise<AuthResponse> {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Invalid email or password", 401);
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Invalid email or password", 401);
  }

  const tokens = await issueTokens(user._id.toHexString(), user.email);
  return buildAuthResponse(toPublicUser(user), tokens);
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const payload = await verifyRefreshToken(refreshToken);
  const session = await findRefreshSession(payload.jti);

  if (!session) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Refresh session not found", 401);
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "User not found", 401);
  }

  await deleteRefreshSession(payload.jti);
  const tokens = await issueTokens(user._id.toHexString(), user.email);
  return buildAuthResponse(toPublicUser(user), tokens);
}

export async function logout(refreshToken: string): Promise<void> {
  try {
    const payload = await verifyRefreshToken(refreshToken);
    await deleteRefreshSession(payload.jti);
  } catch {
    // Idempotent logout — invalid token is treated as already logged out
  }
}

export async function getMe(userId: string): Promise<User> {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "User not found", 404);
  }
  return toPublicUser(user) as User;
}
