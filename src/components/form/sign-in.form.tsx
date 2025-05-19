import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useId, useState } from "react";
import { toast } from "sonner";
import { signIn } from "~/utils/client/auth";
import PasswordInput from "~/components/input/password.input";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function SignInForm({
	handleSetActiveIndex,
}: { handleSetActiveIndex: (index: number) => void }) {
	const id = useId();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(true);
	const router = useRouter();
	const { data: socials } = useQuery({
		queryKey: ["socials"],
		queryFn: () =>
			fetch("/api/socials").then((res) => res.json() as Promise<string[]>),
	});

	const { mutate, status } = useMutation({
		mutationFn: () =>
			signIn.email({
				email,
				password,
			}),
		onSuccess: async (data) => {
			if (!data.error) {
				toast.success("Signed in successfully");
				await router.invalidate();
				router.navigate({ to: "/" });
				return;
			}
			toast.error(data.error.message);
		},
		onError: (error) => {
			toast.error(error.message);
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
			<form className="space-y-5">
				<div className="space-y-4">
					<div className="*:not-first:mt-2">
						<Label htmlFor={`${id}-email`}>Email</Label>
						<Input
							id={`${id}-email`}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="hi@yourcompany.com"
							type="email"
							required
						/>
					</div>
					<div className="*:not-first:mt-2">
						<Label htmlFor={`${id}-password`}>Password</Label>
						<PasswordInput
							id={`${id}-password`}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Enter your password"
							required
						/>
					</div>
				</div>
				<div className="flex justify-between gap-2">
					<div className="flex items-center gap-2">
						<Checkbox
							id={`${id}-remember`}
							onCheckedChange={(e) => setRemember(!!e)}
							checked={remember}
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
					type="button"
					className="w-full"
					onClick={() => mutate()}
					disabled={status === "pending"}
				>
					Sign in
				</Button>
			</form>
		</>
	);
}
