import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { signIn, signUp } from "~/utils/client/auth";
import PasswordInput from "~/components/input/password.input";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const signUpSchema = z.object({
	first_name: z.string().min(1, "First name is required"),
	last_name: z.string().min(1, "Last name is required"),
	email: z.string().email("Invalid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
	const id = useId();
	const router = useRouter();
	const form = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			first_name: "",
			last_name: "",
			email: "",
			password: "",
		},
	});
	const { data: socials } = useQuery({
		queryKey: ["socials"],
		queryFn: () =>
			fetch("/api/socials").then((res) => res.json() as Promise<string[]>),
	});

	const signupMutation = useMutation({
		mutationFn: () =>
			signUp.email({
				email: form.getValues("email"),
				password: form.getValues("password"),
				name: `${form.getValues("first_name")} ${form.getValues("last_name")}`,
			}),
		onSuccess: async (ctx) => {
			if (!ctx.error) {
				await router.invalidate();
				router.navigate({ to: "/" });
				toast.success("Signed up successfully");
				return;
			}
			toast.error(ctx.error.message);
		},
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
				onSubmit={form.handleSubmit((data) => signupMutation.mutate())}
			>
				<div className="space-y-4">
					<div className="flex justify-between space-x-1">
						<div className="*:not-first:mt-2 w-full">
							<Label htmlFor={`${id}-first-name`}>First name</Label>
							<Input
								id={`${id}-first-name`}
								placeholder="Matt"
								type="text"
								autoComplete="name"
								{...form.register("first_name")}
								aria-invalid={!!form.formState.errors.first_name}
							/>
							{form.formState.errors.first_name && (
								<p className="text-sm text-red-500 mt-1">
									{form.formState.errors.first_name.message}
								</p>
							)}
						</div>
						<div className="*:not-first:mt-2 w-full">
							<Label htmlFor={`${id}-last-name`}>Last name</Label>
							<Input
								id={`${id}-last-name`}
								placeholder="Welsh"
								type="text"
								autoComplete="name"
								{...form.register("last_name")}
								aria-invalid={!!form.formState.errors.last_name}
							/>
							{form.formState.errors.last_name && (
								<p className="text-sm text-red-500 mt-1">
									{form.formState.errors.last_name.message}
								</p>
							)}
						</div>
					</div>
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
							placeholder="Enter your password"
							autoComplete="new-password webauthn"
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
				<Button
					type="submit"
					className="w-full"
					disabled={signupMutation.status === "pending"}
				>
					{signupMutation.status === "pending" ? "Signing up..." : "Sign up"}
				</Button>
			</form>

			<p className="text-muted-foreground text-center text-xs">
				By signing up you agree to our{" "}
				{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
				<a className="underline hover:no-underline" href="#">
					Terms
				</a>
				.
			</p>
		</>
	);
}
