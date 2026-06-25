import { ERROR_CODES, JWT_ACCESS_TOKEN_TTL_SECONDS } from "@vibevault/config";
import { env } from "@vibevault/config/server";
import { SignJWT, jwtVerify } from "jose";
import { AppError } from "./errors";

const encoder = new TextEncoder();
const secret = encoder.encode(env.JWT_SECRET);

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: "refresh";
}

export async function signAccessToken(
  userId: string,
  email: string,
): Promise<string> {
  return new SignJWT({ email, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${JWT_ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(secret);
}

export async function signRefreshToken(
  userId: string,
  jti: string,
): Promise<string> {
  return new SignJWT({ jti, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload & { sub: string }> {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (payload.type !== "access" || typeof payload.sub !== "string") {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, "Invalid access token", 401);
    }

    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      type: "access",
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Invalid or expired access token", 401);
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<RefreshTokenPayload & { sub: string }> {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (
      payload.type !== "refresh" ||
      typeof payload.sub !== "string" ||
      typeof payload.jti !== "string"
    ) {
      throw new AppError(ERROR_CODES.UNAUTHORIZED, "Invalid refresh token", 401);
    }

    return {
      sub: payload.sub,
      jti: payload.jti,
      type: "refresh",
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Invalid or expired refresh token", 401);
  }
}

export function createTokenId(): string {
  return crypto.randomUUID();
}
