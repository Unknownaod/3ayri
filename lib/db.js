import { Redis } from "@upstash/redis";
export const redis = Redis.fromEnv();

export const RESERVED = ["dashboard", "api", "giveaways", "partners", "login", "logout", "admin", "settings", "_next"];
export const validUsername = (u) => /^[a-z0-9_]{3,20}$/.test(u) && !RESERVED.includes(u);
