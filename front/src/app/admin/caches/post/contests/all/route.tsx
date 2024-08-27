import { hasAdminPremission } from "@/lib/accounts/permission";
import { clearCache } from "@/lib/contest";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {

	if (!(await hasAdminPremission())) {

		return new Response("Forbidden", { status: 403 });

	}

	clearCache();

	return new Response("OK");

}
