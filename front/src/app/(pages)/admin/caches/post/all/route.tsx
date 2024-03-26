import { hasAdminPremission } from "@/app/(pages)/admin/permission";
import redis from "@/app/redis";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {

	if (!(await hasAdminPremission())) {

		return new Response("Forbidden", { status: 403 });

	}

	redis.flushAll();

	return new Response("OK");

}
