import type { QueryClient } from "@tanstack/react-query";
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import type * as React from "react";
import { Toaster } from "sonner";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary.js";
import { NotFound } from "~/components/NotFound.js";
import SignInDialog from "~/components/dialog/sign-in.dialog";
import { MainNav } from "~/components/navigation/main-nav";
import appCss from "~/styles/app.css?url";
import { auth } from "~/utils/auth";
import { seo } from "~/utils/seo.js";

const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
	const req = getWebRequest();
	if (!req) {
		return null;
	}
	const sess = await auth.api.getSession({ headers: req.headers });

	return sess;
});

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...seo({
				title:
					"TanStack x Better Auth Template",
				description:
					"A template for using TanStack Start with Better Auth.",
			}),
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
			{ rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),
	beforeLoad: async () => {
		const user = await fetchUser();

		return {
			user: user?.user,
			session: user?.session,
		};
	},
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		);
	},
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

export function RootDocument({ children }: { children: React.ReactNode }) {
	const { user } = Route.useRouteContext();

	// This inline script will run before any rendering occurs
	// It's the most reliable way to prevent flash of incorrect theme
	const blockingScript = `
		(function() {
			try {
				// Get theme from localStorage if it exists
				var stored = localStorage.getItem('theme');
				var theme = 'light';
				
				if (stored) {
					var parsed = JSON.parse(stored);
					if (parsed && parsed.state && parsed.state.theme) {
						theme = parsed.state.theme;
					}
				} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
					// Otherwise use system preference
					theme = 'dark';
				}
				
				// Apply theme immediately before any rendering
				document.documentElement.classList.remove('light', 'dark');
				document.documentElement.classList.add(theme);
			} catch (e) {
				// Fallback to light theme if something goes wrong
				console.error('Error setting theme:', e);
			}
		})();
	`;

	return (
		<html lang="en">
			<head>
				{/* Blocking inline script to prevent flash of incorrect theme */}
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: Needed for Theme Script */}
				<script dangerouslySetInnerHTML={{ __html: blockingScript }} />
				<HeadContent />
			</head>
			<body className="min-h-screen bg-background text-foreground transition-colors">
				<div className="flex min-h-screen flex-col">
					<MainNav />
					<main className="flex-1">{children}</main>
				</div>
				{!user && <SignInDialog />}
				<Toaster />
				<TanStackRouterDevtools position="bottom-right" />
				<Scripts />
			</body>
		</html>
	);
}
