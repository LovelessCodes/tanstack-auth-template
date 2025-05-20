import { useMutation } from "@tanstack/react-query";
import { KeyIcon, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
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
import { passkey } from "~/utils/client/auth";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

const passkeyFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
});

type PasskeyFormValues = z.infer<typeof passkeyFormSchema>;

interface AddPasskeyDialogProps {
	onSuccess: () => void;
}

export function AddPasskeyDialog({ onSuccess }: AddPasskeyDialogProps) {
	const [open, setOpen] = useState(false);
	const form = useForm<PasskeyFormValues>({
		resolver: zodResolver(passkeyFormSchema),
		defaultValues: {
			name: "",
		},
	});

	const { mutate: createPasskey, isPending } = useMutation({
		mutationFn: async ({ name }: { name: string }) =>
			passkey.addPasskey({ name }),
		onMutate: () => {
			toast.loading("Adding passkey...", {
				id: "add-passkey",
			});
		},
		onSuccess: (d) => {
			if (d?.error) {
				toast.error(d.error.message, {
					id: "add-passkey",
				});
				return;
			}
			toast.success("Passkey added successfully", {
				id: "add-passkey",
			});
			onSuccess();
			setOpen(false);
			form.reset();
		},
		onError: () => {
			toast.error("Failed to add passkey", {
				id: "add-passkey",
			});
		},
	});

	const onSubmit = (data: PasskeyFormValues) => {
		createPasskey(data);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								onClick={() => setOpen(true)}
							>
								<PlusIcon className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Add Passkey</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<KeyIcon className="h-5 w-5" />
						Add New Passkey
					</DialogTitle>
					<DialogDescription>
						Enter a name for your new passkey. This will help you identify it
						later.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Passkey Name</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., MacBook Pro Touch ID"
											{...field}
											disabled={isPending}
										/>
									</FormControl>
									<FormDescription>
										This name will help you identify this passkey.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter className="mt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Adding..." : "Add Passkey"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
