import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "../auth";

export async function getUser() {
	const req = getWebRequest();
	if (!req) {
		return;
	}
	const sess = await auth.api.getSession({ headers: req.headers });
	if (!sess?.user) {
		return;
	}
	return sess.user;
}
