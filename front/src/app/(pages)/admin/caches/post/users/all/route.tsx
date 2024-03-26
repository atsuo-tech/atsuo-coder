import { hasAdminPremission } from "@/app/(pages)/admin/permission";
import { clearCache } from "@/lib/user";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {

	if (!(await hasAdminPremission())) {

		return new Response("Forbidden", { status: 403 });

	}

	clearCache();

	return new Response("OK");

}
