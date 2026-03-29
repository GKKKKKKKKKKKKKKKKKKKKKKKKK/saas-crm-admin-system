import crypto from "node:crypto";

export const generateOpaqueToken = () => crypto.randomBytes(32).toString("hex");

export const hashOpaqueToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");
