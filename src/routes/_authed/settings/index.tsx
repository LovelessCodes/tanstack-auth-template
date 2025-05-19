import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Settings, Share2, Shield, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Route as RootRoute } from "~/routes/__root";

export const Route = createFileRoute("/_authed/settings/")({
	component: SettingsIndexPage,
});

function SettingsIndexPage() {
	const { user } = RootRoute.useRouteContext();

	if (!user) {
		return (
			<div className="container mx-auto p-4 text-center py-12">
				<h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
				<p className="text-muted-foreground mb-6">
					You need to sign in to access your settings.
				</p>
			</div>
		);
	}

	const settingsCategories: {
		title: string;
		description: string;
		icon: React.ReactNode;
		link: string;
		disabled?: boolean;
	}[] = [
		{
			title: "Profile Settings",
			description: "Manage your profile sharing preferences and username",
			icon: <Share2 className="h-6 w-6" />,
			link: "/settings/profile",
		},
		{
			title: "Account Settings",
			description: "Update your account information and email preferences",
			icon: <User className="h-6 w-6" />,
			link: "/settings/account",
		},
		{
			title: "Privacy & Security",
			description: "Control your privacy settings and security preferences",
			icon: <Shield className="h-6 w-6" />,
			link: "/settings/privacy",
		},
	];

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-3xl font-bold mb-8">Settings</h1>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{settingsCategories.map((category) => (
					<Card key={category.title} className="flex flex-col">
						<CardHeader>
							<div className="flex items-center gap-2">
								<div className="p-2 rounded-md bg-muted">{category.icon}</div>
								<div>
									<CardTitle>{category.title}</CardTitle>
								</div>
							</div>
							<CardDescription>{category.description}</CardDescription>
						</CardHeader>
						<CardFooter className="mt-auto">
							<Button
								asChild
								variant="outline"
								className="w-full"
								disabled={category.disabled}
							>
								<Link to={category.link} disabled={category.disabled}>
									{category.disabled ? "Coming Soon" : "Manage Settings"}
								</Link>
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
