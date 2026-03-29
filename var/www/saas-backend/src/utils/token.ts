import jwt, { type SignOptions } from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";

export interface JwtUserPayload {
  userId: string;
  username: string;
  roleCode: string;
  permissions: string[];
}

export const signAccessToken = (payload: JwtUserPayload) =>
  jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn as SignOptions["expiresIn"] });

export const verifyAccessToken = (token: string) => jwt.verify(token, jwtConfig.secret) as JwtUserPayload;
