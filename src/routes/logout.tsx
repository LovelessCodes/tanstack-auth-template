import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "~/utils/auth";

const logoutFn = createServerFn().handler(async () => {
	const req = getWebRequest();
	if (!req) {
		return;
	}

	await auth.api.signOut({
		headers: req.headers,
	});

	throw redirect({
		href: "/",
	});
});

export const Route = createFileRoute("/logout")({
	preload: false,
	loader: () => logoutFn(),
});
