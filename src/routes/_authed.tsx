import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
	beforeLoad: async ({ context, location }) => {
		if (!context.user) {
			throw redirect({
				to: "/",
				search: {
					redirect: location.href,
				}
			});
		}
	},
	component: AuthedLayout,
});

function AuthedLayout() {
	return <Outlet />;
}
