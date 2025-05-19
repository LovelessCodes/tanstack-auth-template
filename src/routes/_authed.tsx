import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
	beforeLoad: async ({ context }) => {
		if (!context.user) {
			throw redirect({
				href: "/",
			});
		}
	},
	loader: () => null,
	component: AuthedLayout,
});

function AuthedLayout() {
	return <Outlet />;
}
