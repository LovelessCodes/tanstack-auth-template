import {
	adminClient,
	inferAdditionalFields,
	passkeyClient,
} from "better-auth/client/plugins";
import { twoFactorClient } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";

export const {
	admin,
	passkey,
	twoFactor,
	useSession,
	useListPasskeys,
	forgetPassword,
	resetPassword,
	linkSocial,
	deleteUser,
	changeEmail,
	changePassword,
	revokeSession,
	revokeOtherSessions,
	revokeSessions,
	signIn,
	signOut,
	signUp,
	getSession,
	listSessions,
	sendVerificationEmail,
	unlinkAccount,
	updateUser,
	verifyEmail,
	$ERROR_CODES,
} = createAuthClient({
	// @ts-ignore
	baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:4005",
	plugins: [
		twoFactorClient(),
		adminClient(),
		passkeyClient(),
		inferAdditionalFields({
			user: {
				username: {
					type: "string",
					required: false,
				},
				profilePrivate: {
					type: "boolean",
					required: false,
				},
			},
		}),
	],
});
