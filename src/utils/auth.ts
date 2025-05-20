import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, twoFactor } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { db } from "../db";

const providers = [
	"apple",
	"discord",
	"dropbox",
	"facebook",
	"github",
	"gitlab",
	"google",
	"kick",
	"linkedin",
	"microsoft",
	"reddit",
	"roblox",
	"spotify",
	"tiktok",
	"twitch",
	"vk",
	"zoom",
	"x",
];

export const configuredProviders = providers.reduce<
	Record<
		string,
		{
			clientId: string;
			clientSecret: string;
			appBundleIdentifier?: string;
			tenantId?: string;
			requireSelectAccount?: boolean;
			clientKey?: string;
			issuer?: string;
		}
	>
>((acc, provider) => {
	const id = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
	const secret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];
	if (id && id.length > 0 && secret && secret.length > 0) {
		acc[provider] = { clientId: id, clientSecret: secret };
	}
	if (provider === "apple" && Object.keys(acc).includes("apple")) {
		const bundleId =
			process.env[`${provider.toUpperCase()}_APP_BUNDLE_IDENTIFIER`];
		if (bundleId && bundleId.length > 0) {
			acc[provider].appBundleIdentifier = bundleId;
		}
	}
	if (provider === "gitlab" && Object.keys(acc).includes("gitlab")) {
		const issuer = process.env[`${provider.toUpperCase()}_ISSUER`];
		if (issuer && issuer.length > 0) {
			acc[provider].issuer = issuer;
		}
	}
	if (provider === "microsoft" && Object.keys(acc).includes("microsoft")) {
		acc[provider].tenantId = "common";
		acc[provider].requireSelectAccount = true;
	}
	if (provider === "tiktok" && Object.keys(acc).includes("tiktok")) {
		const key = process.env[`${provider.toUpperCase()}_CLIENT_KEY`];
		if (key && key.length > 0) {
			acc[provider].clientKey = key;
		}
	}
	return acc;
}, {});

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {
		enabled: true,
	},
	secret: process.env.BETTER_AUTH_SECRET || undefined,
	allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [],
	socialProviders: configuredProviders,
	plugins: [twoFactor(), passkey({
		rpName: process.env.BETTER_AUTH_APP_NAME || "tanstack-auth-template",
		rpID: process.env.BETTER_AUTH_APP_ID || "localhost",
		origin: process.env.BETTER_AUTH_URL || "http://localhost:4005",
	}), admin()],
	user: {
		additionalFields: {
			username: {
				type: "string",
				required: false,
			},
			profilePrivate: {
				type: "boolean",
				required: false,
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session;
