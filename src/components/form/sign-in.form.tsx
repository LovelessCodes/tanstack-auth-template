import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useId } from "react";
import { toast } from "sonner";
import { signIn } from "~/utils/client/auth";
import PasswordInput from "~/components/input/password.input";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const signInSchema = z.object({
	email: z.string().email("Invalid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	rememberMe: z.boolean(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInForm({
	handleSetActiveIndex,
}: { handleSetActiveIndex: (index: number) => void }) {
	const id = useId();
	const form = useForm<SignInFormValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberMe: true,
		},
	});
	const router = useRouter();
	const { data: socials } = useQuery({
		queryKey: ["socials"],
		queryFn: () =>
			fetch("/api/socials").then((res) => res.json() as Promise<string[]>),
	});

	const handleSignIn = async (data: SignInFormValues) => {
		toast.promise(
			signIn.email(
				{
					email: data.email,
					password: data.password,
					rememberMe: data.rememberMe,
				},
				{
					onSuccess: async (data) => {
						if (data.data.twoFactorRedirect) {
							handleSetActiveIndex(3);
							throw {
								error: {
									code: "TWO_FACTOR_REDIRECT",
									message: "Two factor authentication required",
								},
							};
						}
					},
					onError: (error) => {
						if (error.error.code === "INVALID_EMAIL_OR_PASSWORD") {
							form.setError("email", {
								message: "Invalid email or password",
							});
						}
						if (error.error.code === "EMAIL_NOT_VERIFIED") {
							form.setError("email", {
								message: "Email not verified",
							});
						}
						throw error;
					},
				},
			),
			{
				loading: "Signing in...",
				success: async () => {
					await router.invalidate();
					router.navigate({ to: "/" });
					return "Signed in successfully";
				},
				error: (error) => {
					return error.error.message;
				},
			},
		);
	};

	const { mutate, status } = useMutation({
		mutationFn: handleSignIn,
		mutationKey: ["sign-in"],
	});

	return (
		<>
			{socials && socials.length > 0 && (
				<>
					<div className="w-full flex gap-8 justify-center flex-wrap pb-4">
						{socials.map((social) => (
							<Button
								key={social}
								variant="outline"
								// biome-ignore lint/suspicious/noExplicitAny: <explanation>
								onClick={() => signIn.social({ provider: social as any })}
							>
								{social.charAt(0).toUpperCase() + social.slice(1)}
							</Button>
						))}
					</div>
					<div className="before:bg-border after:bg-border mb-4 flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1">
						<span className="text-muted-foreground text-xs">Or</span>
					</div>
				</>
			)}
			<form
				className="space-y-5"
				onSubmit={form.handleSubmit((data) => mutate(data))}
			>
				<div className="space-y-4">
					<div className="*:not-first:mt-2">
						<Label htmlFor={`${id}-email`}>Email</Label>
						<Input
							id={`${id}-email`}
							placeholder="hi@yourcompany.com"
							type="email"
							autoComplete="email"
							{...form.register("email")}
							aria-invalid={!!form.formState.errors.email}
						/>
						{form.formState.errors.email && (
							<p className="text-sm text-red-500 mt-1">
								{form.formState.errors.email.message}
							</p>
						)}
					</div>
					<div className="*:not-first:mt-2">
						<Label htmlFor={`${id}-password`}>Password</Label>
						<PasswordInput
							id={`${id}-password`}
							autoComplete="current-password"
							{...form.register("password")}
							aria-invalid={!!form.formState.errors.password}
						/>
						{form.formState.errors.password && (
							<p className="text-sm text-red-500 mt-1">
								{form.formState.errors.password.message}
							</p>
						)}
					</div>
				</div>
				<div className="flex justify-between gap-2">
					<div className="flex items-center gap-2">
						<Checkbox
							id={`${id}-remember`}
							onCheckedChange={(e) => form.setValue("rememberMe", !!e)}
							checked={form.watch("rememberMe")}
						/>
						<Label
							htmlFor={`${id}-remember`}
							className="text-muted-foreground font-normal"
						>
							Remember me
						</Label>
					</div>
					<button
						type="button"
						onClick={() => handleSetActiveIndex(2)}
						className="text-sm underline hover:no-underline"
					>
						Forgot password?
					</button>
				</div>
				<Button
					type="submit"
					className="w-full"
					disabled={status === "pending"}
				>
					{status === "pending" ? "Signing in..." : "Sign in"}
				</Button>
			</form>
		</>
	);
}
