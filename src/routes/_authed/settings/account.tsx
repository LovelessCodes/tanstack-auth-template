import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ImageIcon, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Route as RootRoute } from "~/routes/__root";
import { changeEmail, updateUser } from "~/utils/client/auth";

// Fetch account settings
const fetchAccountSettings = async () => {
	const response = await fetch("/api/settings/account");
	if (!response.ok) {
		throw new Error("Failed to fetch account settings");
	}
	return response.json();
};

// Form schema
const accountFormSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be less than 50 characters"),
	email: z.string().email("Please enter a valid email address"),
	image: z.string().url("Avatar URL must be a valid URL").nullable().optional(),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters")
		.max(30, "Username must be less than 30 characters")
		.regex(
			/^[a-zA-Z0-9_-]+$/,
			"Username can only contain letters, numbers, underscores, and hyphens",
		)
		.optional(),
});

// Define the form values type
type AccountFormValues = z.infer<typeof accountFormSchema>;

export const Route = createFileRoute("/_authed/settings/account")({
	component: AccountSettingsPage,
});

function AccountSettingsPage() {
	const { user } = RootRoute.useRouteContext();
	const queryClient = useQueryClient();
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const router = useRouter();

	// Mutation to update account settings
	const mutation = useMutation({
		mutationFn: () => {
			if (user?.name !== form.getValues("name")) {
				return updateUser({
					name: form.getValues("name"),
				});
			}
			if (user?.username !== form.getValues("username")) {
				return updateUser({
					username: form.getValues("username"),
				});
			}
			if (user?.email !== form.getValues("email")) {
				return changeEmail({
					newEmail: form.getValues("email"),
				});
			}
			if (user?.image !== form.getValues("image")) {
				return updateUser({
					image: form.getValues("image"),
				});
			}
			throw new Error("No changes detected");
		},
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ["accountSettings"] });
			// Also invalidate the user context since we might have updated user data
			queryClient.invalidateQueries({ queryKey: ["user"] });
			await router.invalidate();
			toast.success("Account settings updated successfully");
		},
		onError: (error) => {
			toast.error("Error updating account settings", {
				description: error.message,
			});
		},
	});

	// Form setup
	const form = useForm<AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues: {
			name: "",
			email: "",
			image: null,
			username: "",
		},
	});

	// Update form values when data is loaded
	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name || "",
				email: user.email || "",
				image: user.image || null,
				username: user.username || "",
			});
			setAvatarPreview(user.image || null);
		}
	}, [user, form]);

	// Handle avatar preview
	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value && value.trim() !== "") {
			setAvatarPreview(value);
		} else {
			setAvatarPreview(null);
		}
	};

	const onSubmit = (values: AccountFormValues) => {
		mutation.mutate();
	};

	// Generate initials for avatar fallback
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	if (!user) {
		return (
			<div className="container mx-auto p-4 text-center py-12">
				<h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
				<p className="text-muted-foreground mb-6">
					You need to sign in to access your account settings.
				</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-8">Account Settings</h1>

			<div className="grid gap-8 w-full">
				<Card>
					<CardHeader>
						<CardTitle>Personal Information</CardTitle>
						<CardDescription>
							Update your personal information and how you appear on the
							platform
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								<div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
									<Avatar className="w-24 h-24">
										<AvatarImage
											src={avatarPreview || undefined}
											alt={user.name || "User"}
										/>
										<AvatarFallback className="text-lg">
											{getInitials(user.name || user.email || "User")}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<FormField
											name="image"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Avatar URL</FormLabel>
													<FormControl>
														<div className="flex gap-2">
															<div className="relative flex-1">
																<ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
																<Input
																	placeholder="https://example.com/avatar.jpg"
																	className="pl-9"
																	{...field}
																	value={field.value || ""}
																	onChange={(e) => {
																		field.onChange(e);
																		handleAvatarChange(e);
																	}}
																/>
															</div>
														</div>
													</FormControl>
													<FormDescription>
														Enter a URL for your avatar image. Leave empty to
														use initials.
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								</div>

								<FormField
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Full Name</FormLabel>
											<FormControl>
												<div className="relative">
													<User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
													<Input
														placeholder="Your Name"
														className="pl-9"
														{...field}
													/>
												</div>
											</FormControl>
											<FormDescription>This is your full name.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									name="username"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Username</FormLabel>
											<FormControl>
												<div className="relative">
													<User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
													<Input
														placeholder="Your Username"
														className="pl-9"
														{...field}
													/>
												</div>
											</FormControl>
											<FormDescription>
												This is your public username.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email Address</FormLabel>
											<FormControl>
												<div className="relative">
													<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
													<Input
														placeholder="your.email@example.com"
														className="pl-9"
														{...field}
													/>
												</div>
											</FormControl>
											<FormDescription>
												This email is used for login and notifications.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<CardFooter className="px-0 pt-4">
									<Button
										type="submit"
										disabled={mutation.isPending || !form.formState.isDirty}
									>
										{mutation.isPending ? "Saving..." : "Save Changes"}
									</Button>
								</CardFooter>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
