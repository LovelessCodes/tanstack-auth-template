import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
	CheckIcon,
	QrCodeIcon,
	RectangleEllipsisIcon,
	XIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { TwoFactorDialog } from "~/components/dialog/two-factor.dialog";
import PasswordInput from "~/components/input/password.input";
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
import { $ERROR_CODES, changePassword } from "~/utils/client/auth";

export const Route = createFileRoute("/_authed/settings/privacy")({
	component: SecuritySettingsPage,
});

const passwordFormSchema = z
	.object({
		old_password: z.string(),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirm_password: z
			.string()
			.min(8, "Password must be at least 8 characters"),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: "Passwords do not match",
		path: ["confirm_password"],
	})
	.refine((data) => data.old_password !== data.password, {
		message: "New password must be different from old password",
		path: ["password"],
	});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

function SecuritySettingsPage() {
	const { user } = RootRoute.useRouteContext();

	const form = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordFormSchema),
		defaultValues: {
			old_password: "",
			password: "",
			confirm_password: "",
		},
	});

	const onSubmit = (values: PasswordFormValues) => {
		mutation.mutate(values);
	};

	const mutation = useMutation({
		mutationFn: (values: PasswordFormValues) =>
			changePassword({
				currentPassword: values.old_password,
				newPassword: values.password,
			}),
		onSuccess: (d) => {
			if (d.error) {
				toast.error("Error updating password", {
					description: `${d.error.message}`,
				});
				if (["INVALID_PASSWORD"].includes(d.error.code || "")) {
					form.setError("old_password", {
						message: d.error.message,
					});
				}
				if (
					["PASSWORD_TOO_LONG", "PASSWORD_TOO_SHORT"].includes(
						d.error.code || "",
					)
				) {
					form.setError("password", {
						message: d.error.message,
					});
				}
				return;
			}
			toast.success("Password updated successfully");
		},
		onError: (error) => {
			toast.error("Error updating password", {
				description: error.message,
			});
		},
	});

	if (!user) {
		return (
			<div className="container mx-auto p-4 text-center py-12">
				<h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
				<p className="text-muted-foreground mb-6">
					You need to sign in to access your security settings.
				</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-8">Security Settings</h1>

			<div className="grid gap-8 w-full">
				<Card>
					<CardHeader>
						<CardTitle>Password</CardTitle>
						<CardDescription>
							Change your password to enhance your account security.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								<FormField
									name="old_password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Old Password</FormLabel>
											<FormControl>
												<PasswordInput
													placeholder="your-old-password"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<PasswordInput
													placeholder="your-password"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									name="confirm_password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm Password</FormLabel>
											<FormControl>
												<PasswordInput
													placeholder="your-new-password"
													{...field}
													value={field.value || ""}
												/>
											</FormControl>
											<FormMessage />
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
						<CardTitle>Two Factor Authentication</CardTitle>
						<CardDescription>
							Enable two factor authentication to add an extra layer of security
							to your account.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							<div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
								<div className="flex flex-col gap-2">
									<div className="relative justify-center gap-4 items-center flex">
										<RectangleEllipsisIcon className="h-4 w-4 text-muted-foreground" />
										{user?.twoFactorEnabled ? (
											<CheckIcon className="h-4 w-4 text-green-500" />
										) : (
											<XIcon className="h-4 w-4 text-red-500" />
										)}
									</div>
									<TwoFactorDialog
										is2FAEnabled={!!user?.twoFactorEnabled}
									/>
								</div>
							</div>
							{/* <CardFooter className="px-0 pt-4">
                <Button type="submit" disabled={mutation.isPending || !form.formState.isDirty}>
                  {mutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter> */}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Passkeys</CardTitle>
						<CardDescription>
							Add a passkey to your account for an additional layer of security.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		</div>
	);
}
