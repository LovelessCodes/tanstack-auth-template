import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/db";
import { user as userSchema } from "~/db/schema/auth-schema";
import { getUser } from "~/utils/api/user";

// Profile settings schema
const profileSettingsSchema = z.object({
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(30, "Username must be less than 30 characters")
		.regex(
			/^[a-zA-Z0-9_-]+$/,
			"Username can only contain letters, numbers, underscores, and hyphens",
		)
		.optional(),
	profilePrivate: z.boolean().default(false),
});

export const APIRoute = createAPIFileRoute("/api/settings/profile")({
	// Get user profile settings
	GET: async ({ request }) => {
		try {
			const user = await getUser();

			if (!user) {
				return json({ error: "Unauthorized" }, { status: 401 });
			}

			// Return the profile settings
			return json({
				username: user.username || "",
				profilePrivate: user.profilePrivate || false,
			});
		} catch (error) {
			console.error("Error fetching profile settings:", error);
			return json(
				{ error: "Failed to fetch profile settings" },
				{ status: 500 },
			);
		}
	},

	// Update user profile settings
	POST: async ({ request }) => {
		try {
			const user = await getUser();

			if (!user) {
				return json({ error: "Unauthorized" }, { status: 401 });
			}

			// Parse and validate the request body
			const body = await request.json();
			const validatedData = profileSettingsSchema.safeParse(body);

			if (!validatedData.success) {
				return json({ error: validatedData.error.format() }, { status: 400 });
			}

			// If username is provided, check if it's already taken
			if (validatedData.data.username) {
				const existingUser = await db.query.user.findFirst({
					where: eq(userSchema.username, validatedData.data.username),
				});

				if (existingUser && existingUser.id !== user.id) {
					return json({ error: "Username is already taken" }, { status: 400 });
				}
			}

			// Update the user profile
			await db
				.update(userSchema)
				.set({
					username: validatedData.data.username || null,
					profilePrivate: validatedData.data.profilePrivate,
					updatedAt: new Date(),
				})
				.where(eq(userSchema.id, user.id));

			return json({
				success: true,
				username: validatedData.data.username || null,
				profilePrivate: validatedData.data.profilePrivate,
			});
		} catch (error) {
			console.error("Error updating profile settings:", error);
			return json(
				{ error: "Failed to update profile settings" },
				{ status: 500 },
			);
		}
	},
});
