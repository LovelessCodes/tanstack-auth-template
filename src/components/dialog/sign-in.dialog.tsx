import { Slot } from "@radix-ui/react-slot";
import { OTPInput } from "input-otp";
import { ChevronLeft } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import useMeasure from "react-use-measure";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { TransitionPanel } from "~/components/ui/transition-panel";
import { signinStore } from "~/hooks/signin.store";
import { SignInForm } from "../form/sign-in.form";
import { SignUpForm } from "../form/sign-up.form";

const CORRECT_CODE = "6548";

export default function SignInDialog() {
	const [activeIndex, setActiveIndex] = useState(0);
	const [direction, setDirection] = useState(1);
	const [ref, bounds] = useMeasure();

	const id = useId();

	const { open, setOpen } = signinStore();

	const [hasGuessed, setHasGuessed] = useState<undefined | boolean>(undefined);
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	const handleSetActiveIndex = (newIndex: number) => {
		setDirection(newIndex > activeIndex ? 1 : -1);
		setActiveIndex(newIndex);
	};

	useEffect(() => {
		if (hasGuessed) {
			closeButtonRef.current?.focus();
		}
	}, [hasGuessed]);

	async function onSubmit(e?: React.FormEvent<HTMLFormElement>) {
		e?.preventDefault?.();

		inputRef.current?.select();
		await new Promise((r) => setTimeout(r, 1_00));

		setHasGuessed(value === CORRECT_CODE);

		setValue("");
		setTimeout(() => {
			inputRef.current?.blur();
		}, 20);
	}

	const TABS = [
		{
			id: "sign-in",
			title: "Sign in",
			description: "Please enter your details to sign in.",
			footer: (
				<div className="flex items-center">
					<p>Don't have an account yet?</p>
					<Button variant="link" onClick={() => handleSetActiveIndex(1)}>
						Sign up
					</Button>
				</div>
			),
			content: <SignInForm handleSetActiveIndex={handleSetActiveIndex} />,
		},
		{
			id: "sign-up",
			title: "Sign up",
			description: "Enter your credentials to sign up for an account.",
			footer: (
				<div className="flex items-center">
					<p>Already have an account?</p>
					<Button variant="link" onClick={() => handleSetActiveIndex(0)}>
						Sign in
					</Button>
				</div>
			),
			content: <SignUpForm />,
		},
		{
			id: "forgot-password",
			title: "Forgot password",
			description: "Enter your email to reset your password.",
			content: (
				<div className="space-y-4">
					<Input
						id={`${id}-email`}
						placeholder="hi@yourcompany.com"
						type="email"
						autoComplete="email"
						required
					/>
					<Button type="button" className="w-full">
						Reset password
					</Button>
				</div>
			),
		},
		{
			id: "otp",
			title: "Enter OTP",
			description: "Enter the OTP sent to your email.",
			content: (
				<>
					{hasGuessed ? (
						<div className="text-center">
							<DialogClose asChild>
								<Button type="button" ref={closeButtonRef}>
									Close
								</Button>
							</DialogClose>
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex justify-center">
								<OTPInput
									id="cofirmation-code"
									ref={inputRef}
									value={value}
									onChange={setValue}
									containerClassName="flex items-center gap-3 has-disabled:opacity-50"
									maxLength={4}
									onFocus={() => setHasGuessed(undefined)}
									render={({ slots }) => (
										<div className="flex gap-2">
											{slots.map((slot, idx) => (
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												<Slot key={idx} {...slot} />
											))}
										</div>
									)}
									onComplete={onSubmit}
								/>
							</div>
							{hasGuessed === false && (
								<p
									className="text-muted-foreground text-center text-xs"
									role="alert"
									aria-live="polite"
								>
									Invalid code. Please try again.
								</p>
							)}
							<p className="text-center text-sm">
								{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
								<a className="underline hover:no-underline" href="#">
									Resend code
								</a>
							</p>
						</div>
					)}
				</>
			),
		},
	];

	useEffect(() => {
		if (activeIndex < 0) setActiveIndex(0);
		if (activeIndex >= TABS.length) setActiveIndex(TABS.length - 1);
	}, [activeIndex, TABS.length]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="overflow-x-hidden px-16">
				{activeIndex !== 0 && (
					<button
						type="button"
						className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 left-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
						onClick={() => handleSetActiveIndex(0)}
					>
						<ChevronLeft width={24} height={24} />
						<span className="sr-only">Go back</span>
					</button>
				)}
				<div className="flex flex-col gap-2">
					<DialogHeader>
						<DialogTitle className="sm:text-left">
							{TABS[activeIndex].title}
						</DialogTitle>
						<DialogDescription className="sm:text-left">
							{TABS[activeIndex].description}
						</DialogDescription>
					</DialogHeader>
				</div>
				<TransitionPanel
					activeIndex={activeIndex}
					variants={{
						enter: (direction) => ({
							x: direction > 0 ? 364 : -364,
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
						exit: (direction) => ({
							zIndex: 0,
							x: direction < 0 ? 364 : -364,
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
							{tab.content as ReactNode}
						</div>
					))}
				</TransitionPanel>
				{TABS[activeIndex].footer && (
					<DialogFooter>{TABS[activeIndex].footer}</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
}
