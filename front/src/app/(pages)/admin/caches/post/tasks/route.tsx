import { NextRequest } from "next/server";
import { hasAdminPremission } from "../../../permission";
import redis from "@/app/redis";

export async function POST(request: NextRequest) {

	if (!(await hasAdminPremission())) {

		return new Response("Forbidden", { status: 403 });

	}

	const form = await request.json();

	if (typeof form.id != "string") {

		return new Response("Bad Request", { status: 400 });

	}

	await redis.del(`task:${form.id}`);

	return new Response("OK");

}
