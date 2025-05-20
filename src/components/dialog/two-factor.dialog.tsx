import { useState } from "react";
import useMeasure from "react-use-measure";
import {
	CheckCircle,
	Copy,
	QrCodeIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import PasswordInput from "~/components/input/password.input";
import { TransitionPanel } from "~/components/ui/transition-panel";
import { twoFactor } from "~/utils/client/auth";
import { useRouter } from "@tanstack/react-router";
import TwoFactorForm from "../form/two-factor.form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface TwoFactorDialogProps {
	is2FAEnabled: boolean;
	isShowQR?: boolean;
}

export function TwoFactorDialog({
	is2FAEnabled,
	isShowQR,
}: TwoFactorDialogProps) {
	const [direction, setDirection] = useState(1);
	const [activeIndex, setActiveIndex] = useState(0);
	const [open, setOpen] = useState(false);
	const [ref, bounds] = useMeasure();
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [secret, setSecret] = useState("");
	const [qrCodeUri, setQrCodeUri] = useState("");
	const [isCopied, setIsCopied] = useState(false);
	const router = useRouter();

	const handleSetActiveIndex = (newIndex: number) => {
		setDirection(newIndex > activeIndex ? 1 : -1);
		setActiveIndex(newIndex);
	};

	const handleClose = () => {
		setOpen(false);
		setPassword("");
		setError("");
		handleSetActiveIndex(0);
		setSecret("");
		setQrCodeUri("");
		setIsCopied(false);
	};

	const handleEnable2FA = async () => {
		if (!password) {
			setError("Please enter your password");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			return;
		}

		toast.promise(
			isShowQR
				? twoFactor.getTotpUri({
						password,
					})
				: twoFactor.enable({
						password,
						// @ts-ignore
						issuer: import.meta.env.VITE_BETTER_AUTH_APP_NAME || "tanstack-auth-template",
					}),
			{
				loading: "Verifying password...",
				success: (d) => {
					if (d.error) {
						throw d.error;
					}
					const url = new URL(d.data.totpURI);
					setSecret(url.searchParams.get("secret") || "");
					setQrCodeUri(d.data.totpURI);
					handleSetActiveIndex(1);
					return "Password verified successfully";
				},
				error: (e) => {
					return e.message;
				},
			},
		);
	};

	const handleDisable2FA = async () => {
		if (!password) {
			setError("Please enter your password");
			return;
		}

		toast.promise(
			twoFactor.disable({
				password,
			}),
			{
				loading: "Disabling two-factor authentication...",
				success: () => {
					handleSetActiveIndex(3);
					router.invalidate();
					return "Two-factor authentication disabled successfully";
				},
				error: (e) => {
					return e.message;
				},
			},
		);
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
			toast.success("Copied to clipboard");
		} catch (err) {
			toast.error("Failed to copy to clipboard");
		}
	};

	const TABS = [
		{
			id: "password",
			title: "Confirm your password",
			description: "Enter your password to enable two-factor authentication.",
			content: (
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<PasswordInput
							id="password"
							value={password}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setPassword(e.target.value)
							}
							placeholder="Enter your password"
						/>
					</div>
					{error && <p className="text-sm text-red-500">{error}</p>}
					<div className="flex justify-end gap-2 pt-2">
						<Button type="button" variant="outline" onClick={handleClose}>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={
								is2FAEnabled && !isShowQR ? handleDisable2FA : handleEnable2FA
							}
							disabled={!password}
						>
							{is2FAEnabled && !isShowQR ? "Disable 2FA" : "Continue"}
						</Button>
					</div>
				</div>
			),
		},
		{
			id: "qrCode",
			title: "Set up two-factor authentication",
			description:
				"Scan the QR code below with your authenticator app or enter the secret key manually.",
			content: (
				<>
					<div className="flex flex-col items-center space-y-4">
						<div className="rounded-lg border bg-white p-4">
							<QRCodeSVG value={qrCodeUri} size={200} />
						</div>

						<div className="w-full space-y-2">
							<Label>Or enter this code manually</Label>
							<div className="flex items-center gap-2">
								<Input value={secret} readOnly className="font-mono" />
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() => copyToClipboard(secret)}
								>
									{isCopied ? (
										<CheckCircle className="h-4 w-4 text-green-500" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</Button>
							</div>
							<p className="text-xs text-muted-foreground">
								If you can't scan the QR code, enter this code in your
								authenticator app.
							</p>
						</div>
					</div>

					<div className="flex justify-between pt-2">
						<Button type="button" variant="ghost" onClick={handleClose}>
							Cancel
						</Button>
						<Button type="button" onClick={() => handleSetActiveIndex(2)}>
							I've set up my authenticator
						</Button>
					</div>
				</>
			),
		},
		{
			id: "verify",
			title: "Verify your authenticator app",
			description: "Enter the 6-digit code from your authenticator app.",
			content: (
				<TwoFactorForm
					isShowQR
					onBack={() => handleSetActiveIndex(1)}
					onSuccess={() => handleSetActiveIndex(3)}
				/>
			),
		},
		{
			id: "success",
			title: !is2FAEnabled ? "Two-factor disabled" : "Two-factor enabled",
			description: !is2FAEnabled
				? "Two-factor authentication has been disabled successfully."
				: "Two-factor authentication has been enabled successfully.",
			content: (
				<div className="flex flex-col items-center space-y-6 text-center">
					<div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
						<CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
					</div>
					<div className="space-y-2">
						<h3 className="text-lg font-medium">
							{!is2FAEnabled ? "Two-factor disabled" : "Two-factor enabled"}
						</h3>
						<p className="text-sm text-muted-foreground">
							{!is2FAEnabled
								? "Two-factor authentication has been successfully disabled for your account."
								: "Two-factor authentication has been successfully enabled for your account."}
						</p>
					</div>
					<Button className="w-full" onClick={handleClose}>
						Done
					</Button>
				</div>
			),
		},
	];

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					handleClose();
				}
				setOpen(isOpen);
			}}
		>
			<DialogTrigger asChild>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline" onClick={() => setOpen(true)}>
								{isShowQR ? (
									<QrCodeIcon className="h-4 w-4" />
								) : is2FAEnabled ? (
									"Disable two-factor authentication"
								) : (
									"Enable two-factor authentication"
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{isShowQR ? (
								"Show QR Code"
							) : is2FAEnabled ? (
								"Disable two-factor authentication"
							) : (
								"Enable two-factor authentication"
							)}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</DialogTrigger>
			<DialogContent className="overflow-x-hidden px-16">
				<DialogHeader>
					<DialogTitle>{TABS[activeIndex].title}</DialogTitle>
					<DialogDescription>{TABS[activeIndex].description}</DialogDescription>
				</DialogHeader>
				<TransitionPanel
					activeIndex={activeIndex}
					variants={{
						enter: (dir: number) => ({
							x: dir > 0 ? 364 : -364,
							opacity: 0,
							height: bounds.height > 0 ? bounds.height : "auto",
							position: "initial",
						}),
						center: {
							zIndex: 1,
							x: 0,
							opacity: 1,
							height: bounds.height > 0 ? bounds.height : "auto",
						},
						exit: (dir: number) => ({
							zIndex: 0,
							x: dir < 0 ? 364 : -364,
							opacity: 0,
							position: "absolute",
							top: 0,
							width: "100%",
						}),
					}}
					transition={{
						x: { type: "spring", stiffness: 300, damping: 30 },
						opacity: { duration: 0.2 },
					}}
					custom={direction}
				>
					{TABS.map((tab, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							key={index}
							className={index === activeIndex ? "block" : "hidden"}
							ref={ref}
						>
							{tab.content}
						</div>
					))}
				</TransitionPanel>
			</DialogContent>
		</Dialog>
	);
}
