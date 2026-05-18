import { createDb, type Db } from "@mandujs/core/db";

const url = process.env.DATABASE_URL ?? "sqlite://./local.db";

export const db: Db = createDb({ url });
