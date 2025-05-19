import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Check, Copy, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";
import { z } from "zod";
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
import { Switch } from "~/components/ui/switch";
import { Route as RootRoute } from "~/routes/__root";

// Fetch user profile settings
const fetchProfileSettings = async () => {
	const response = await fetch("/api/settings/profile");
	if (!response.ok) {
		throw new Error("Failed to fetch profile settings");
	}
	return response.json();
};

// Update user profile settings
const updateProfileSettings = async (data: ProfileFormValues) => {
	const response = await fetch("/api/settings/profile", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to update profile settings");
	}

	return response.json();
};

// Form schema
const profileFormSchema = z.object({
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

// Define the form values type explicitly to ensure profilePrivate is always boolean
type ProfileFormValues = {
	username?: string;
	profilePrivate: boolean;
};

export const Route = createFileRoute("/_authed/settings/profile")({
	component: ProfileSettingsPage,
});

function ProfileSettingsPage() {
	const { user } = RootRoute.useRouteContext();
	const queryClient = useQueryClient();
	const [copied, setCopied] = useState(false);
	const [profileUrl, setProfileUrl] = useState("");

	// Query to fetch profile settings
	const { data, isLoading } = useQuery({
		queryKey: ["profileSettings"],
		queryFn: fetchProfileSettings,
		enabled: !!user,
	});

	// Mutation to update profile settings
	const mutation = useMutation({
		mutationFn: updateProfileSettings,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profileSettings"] });
			toast.success("Profile settings updated successfully");
		},
		onError: (error) => {
			toast.error("Error updating profile settings", {
				description: error.message,
			});
		},
	});

	// Form setup
	const form = useForm<ProfileFormValues>({
		// biome-ignore lint/suspicious/noExplicitAny: Type assertion needed due to Zod/React Hook Form type incompatibility
		resolver: zodResolver(profileFormSchema) as any,
		defaultValues: {
			username: "",
			profilePrivate: false,
		},
	});

	// Update form values when data is loaded
	useEffect(() => {
		if (data) {
			form.reset({
				username: user?.username || "",
				profilePrivate: data.profilePrivate || false,
			});

			// Update profile URL
			const username = user?.username || user?.email;
			if (username) {
				setProfileUrl(`${window.location.origin}/profile/${username}`);
			}
		}
	}, [data, form, user]);

	const onSubmit = (values: ProfileFormValues) => {
		mutation.mutate(values);
	};

	const copyProfileLink = () => {
		navigator.clipboard.writeText(profileUrl).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	if (!user) {
		return (
			<div className="container mx-auto p-4 text-center py-12">
				<h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
				<p className="text-muted-foreground mb-6">
					You need to sign in to access your profile settings.
				</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="container mx-auto p-4">Loading profile settings...</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

			<div className="grid gap-8">
				<Card>
					<CardHeader>
						<CardTitle>Profile Sharing</CardTitle>
						<CardDescription>
							Control how others can view your board game collection and
							wishlist
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								<FormField
									name="username"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Username</FormLabel>
											<FormControl>
												<Input
													placeholder="your-username"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormDescription>
												This will be used in your profile URL. If not set, your
												email will be used.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									name="profilePrivate"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-foreground">
													Private Profile
												</FormLabel>
												<FormDescription>
													When enabled, only you can see your collection and
													wishlist
												</FormDescription>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<Button type="submit" disabled={mutation.isPending}>
									{mutation.isPending ? "Saving..." : "Save Changes"}
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Share Your Collection</CardTitle>
						<CardDescription>
							Share your board game collection and wishlist with friends
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{form.watch("profilePrivate") ? (
								<div className="flex items-center gap-2 text-amber-500">
									<AlertCircle className="h-5 w-5" />
									<p>
										Your profile is currently set to private. Enable sharing to
										get a shareable link.
									</p>
								</div>
							) : (
								<>
									<div className="flex items-center gap-2">
										<Share2 className="h-5 w-5 text-muted-foreground" />
										<p>
											Your collection is public and can be shared with this
											link:
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Input value={profileUrl} readOnly />
										<Button
											variant="outline"
											size="icon"
											onClick={copyProfileLink}
										>
											{copied ? (
												<Check className="h-4 w-4" />
											) : (
												<Copy className="h-4 w-4" />
											)}
										</Button>
									</div>
								</>
							)}
						</div>
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							disabled={form.watch("profilePrivate")}
							onClick={() => {
								if (navigator.share) {
									navigator
										.share({
											title: "My Board Game Collection",
											text: "Check out my board game collection on BoardShelf!",
											url: profileUrl,
										})
										.catch((err) => {
											console.error("Error sharing:", err);
											copyProfileLink();
										});
								} else {
									copyProfileLink();
								}
							}}
						>
							<Share2 className="mr-2 h-4 w-4" />
							Share My Collection
						</Button>
					</CardFooter>
				</Card>
			</div>

			<Toaster />
		</div>
	);
}
