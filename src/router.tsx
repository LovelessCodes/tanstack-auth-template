import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { DefaultCatchBoundary } from "./components/DefaultCatchBoundary";
import { NotFound } from "./components/NotFound";
import { routeTree } from "./routeTree.gen";
import { RootDocument } from "./routes/__root";

export function createRouter() {
	const queryClient = new QueryClient();

	return routerWithQueryClient(
		createTanStackRouter({
			routeTree,
			context: {
				queryClient,
			},
			notFoundMode: "root",
			defaultPreload: "intent",
			defaultErrorComponent: (props) => {
				return (
					<RootDocument>
						<DefaultCatchBoundary {...props} />
					</RootDocument>
				);
			},
			defaultNotFoundComponent: () => <NotFound />,
		}),
		queryClient,
	);
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
