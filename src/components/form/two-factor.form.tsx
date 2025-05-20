import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "~/components/ui/input-otp";
import { twoFactor } from "~/utils/client/auth";
import { useRouter } from "@tanstack/react-router";

const twoFactorSchema = z.object({
	code: z.string().length(6, "Verification code must be 6 digits"),
});

type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

export interface TwoFactorFormProps {
	onSuccess?: () => void;
	onBack?: () => void;
}

export function TwoFactorForm({ onSuccess, onBack }: TwoFactorFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const [remainingTime, setRemainingTime] = useState(0);

	// TOTP period is typically 30 seconds
	const TOTP_PERIOD = 30;

	// Calculate remaining time in current TOTP period
	useEffect(() => {
		const interval = setInterval(() => {
			const remainingTime =
				TOTP_PERIOD - 1 - (Math.floor(Date.now() / 1000) % TOTP_PERIOD);
			setRemainingTime(remainingTime);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	// Format seconds to MM:SS
	const formatTime = (seconds: number) => {
		const s = seconds % 60;
		return `${s.toString().padStart(2, "0")}`;
	};

	// Calculate progress percentage for the progress bar
	const progress = (remainingTime / TOTP_PERIOD) * 100;

	const progressColor = () => {
		if (progress < 20) {
			return "bg-red-500";
		}
		if (progress < 40) {
			return "bg-orange-500";
		}
		if (progress < 60) {
			return "bg-yellow-500";
		}
		if (progress < 80) {
			return "bg-green-500";
		}
		return "bg-blue-500";
	};

	const form = useForm<TwoFactorFormValues>({
		resolver: zodResolver(twoFactorSchema),
		defaultValues: {
			code: "",
		},
	});

	const onSubmit = async (data: TwoFactorFormValues) => {
		try {
			setIsLoading(true);
			await twoFactor.verifyTotp(
				{
					code: data.code,
				},
				{
					onSuccess: () => {
						toast.success("Successfully verified and signed in");
						onSuccess?.();
						router.invalidate();
					},
					onError: (error) => {
						toast.error(error.error.message || "Failed to verify code");
						form.setError("code", { message: "Invalid verification code" });
					},
				},
			);
		} catch (error) {
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
			<div className="space-y-4">
				<div className="flex flex-col items-center gap-4">
					<div className="relative w-full max-w-xs">
						<InputOTP
							maxLength={6}
							value={form.watch("code")}
							onChange={(value) =>
								form.setValue("code", value, { shouldValidate: true })
							}
							autoComplete="one-time-code"
							containerClassName="w-full flex justify-center items-center"
						>
							<InputOTPGroup>
								<InputOTPSlot index={0} />
								<InputOTPSlot index={1} />
								<InputOTPSlot index={2} />
							</InputOTPGroup>
							<InputOTPSeparator />
							<InputOTPGroup>
								<InputOTPSlot index={3} />
								<InputOTPSlot index={4} />
								<InputOTPSlot index={5} />
							</InputOTPGroup>
						</InputOTP>
						<div className="absolute -bottom-5 right-0 flex items-center gap-1 text-xs text-muted-foreground">
							<Clock className="h-3 w-3" />
							<span>Expires in {formatTime(remainingTime)}s</span>
						</div>
						<div
							className={`absolute -top-2 left-0 h-0.5 ${progressColor()} transition-all duration-1000 ease-linear`}
							style={{
								width: `${progress}%`,
								transitionProperty: "width",
								transitionDuration: "1s",
								transitionTimingFunction: "linear",
							}}
						/>
					</div>
				</div>

				{form.formState.errors.code && (
					<motion.p
						initial={{ opacity: 0, y: -5 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-destructive text-sm text-center"
					>
						{form.formState.errors.code.message}
					</motion.p>
				)}
			</div>

			<div className="space-y-3">
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Verifying...
						</>
					) : (
						"Verify Code"
					)}
				</Button>

				{onBack && (
					<Button
						type="button"
						variant="ghost"
						className="w-full mt-4"
						onClick={onBack}
						disabled={isLoading}
					>
						Back to sign in
					</Button>
				)}
			</div>
		</form>
	);
}

export default TwoFactorForm;
