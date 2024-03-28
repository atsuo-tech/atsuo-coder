import { deleteCache } from "@/lib/user";
import { NextRequest } from "next/server";
import { hasAdminPremission } from "../../../permission";

export async function POST(request: NextRequest) {

	if (!(await hasAdminPremission())) {

		return new Response("Forbidden", { status: 403 });

	}

	const form = await request.json();

	if (typeof form.id != "string") {

		return new Response("Bad Request", { status: 400 });

	}

	deleteCache(form.id as string);

	return new Response("OK");

}
