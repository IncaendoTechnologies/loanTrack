import { CognitoJwtVerifier } from "aws-jwt-verify";
import { NextFunction, Request, Response } from "express";

const userPoolId = process.env.AWS_COGNITO_EXPENSIVE_USER_POOL_ID;
const clientId = process.env.AWS_COGNITO_EXPENSIVE_USER_POOL_CLIENT_ID;

if (!userPoolId || !clientId) {
  throw new Error(
    "Missing Cognito config. Set AWS_COGNITO_USER_POOL_ID and AWS_COGNITO_USER_POOL_CLIENT_ID."
  );
}

const accessTokenVerifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: "id",
  clientId,
});

type CachedToken = {
  payload: AuthClaims;
  expiresAt: number;
};

const TOKEN_CACHE_TTL_MS = 5 * 60 * 1000;
const tokenCache = new Map<string, CachedToken>();

export type AuthClaims = {
  sub: string;
  username?: string;
  scope?: string;
  [key: string]: unknown;
};

export interface AuthenticatedRequest extends Request {
  auth?: AuthClaims;
}

const getCachedToken = (token: string) => {
  const cached = tokenCache.get(token);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    tokenCache.delete(token);
    return null;
  }
  return cached.payload;
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const authHeader = req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    let payload = getCachedToken(token);
    if (!payload) {
      const verified = await accessTokenVerifier.verify(token);
      payload = verified as AuthClaims;
      tokenCache.set(token, {
        payload,
        expiresAt: Date.now() + TOKEN_CACHE_TTL_MS,
      });
    }
    (req as AuthenticatedRequest).auth = payload;
    return next();
  } catch (error) {
    const authHeader = req.header("Authorization");
    const token = authHeader?.slice("Bearer ".length).trim();
    if (token) tokenCache.delete(token);

    return res.status(401).json({
      error: "Invalid or expired token",
      details: (error as Error).message,
    });
  }
};
