import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { configuredProviders } from "~/utils/auth";

export const APIRoute = createAPIFileRoute("/api/socials")({
	GET: () => {
		return json(Object.keys(configuredProviders));
	},
});
