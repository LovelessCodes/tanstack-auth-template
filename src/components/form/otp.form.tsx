import { Slot } from "@radix-ui/react-slot";
import { OTPInput } from "input-otp";
import { Button } from "~/components/ui/button";
import { DialogClose } from "~/components/ui/dialog";

import { useRef, useState } from "react";

export function OTPForm() {
	const [hasGuessed, setHasGuessed] = useState<undefined | boolean>(undefined);
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	async function onSubmit(e?: React.FormEvent<HTMLFormElement>) {
		e?.preventDefault?.();

		inputRef.current?.select();
		await new Promise((r) => setTimeout(r, 1_00));

		setHasGuessed(value === "1234");

		setValue("");
		setTimeout(() => {
			inputRef.current?.blur();
		}, 20);
	}

	return (
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
	);
}
