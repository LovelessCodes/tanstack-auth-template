import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import * as authSchema from "./schema/auth-schema";

export const db = drizzle({
	connection: {
		url: process.env.TURSO_DATABASE_URL || "file:./dev.db",
		authToken: process.env.TURSO_AUTH_TOKEN,
	},
	schema: {
		...authSchema,
	},
});
