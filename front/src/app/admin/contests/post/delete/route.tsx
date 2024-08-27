import { sql } from "@/app/sql";
import { NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { hasContestAdminPermission } from "../../../../../lib/accounts/permission";
import getUser from "@/lib/user";
import getContest, { deleteCache } from "@/lib/contest";

function Unauthorized() {

	return new Response("Unauthorized", {
		status: 401
	});

}

export async function POST(req: NextRequest) {

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const data = await req.formData();

	if (typeof data.get("id") != "string") {

		return new Response("Bad Request", {
			status: 400
		});

	}

	const contest = await getContest(data.get("id") as string);

	if (!contest) {

		notFound();

	}

	if (!await hasContestAdminPermission() && !(await contest.editors!!.get()).includes(user.getID()!!)) {

		return Unauthorized();

	}

	await deleteCache(data.get("id") as string);
	await sql.query("DELETE FROM contests WHERE id = ?", [data.get("id")]);

	return new Response("301", { status: 301, headers: { location: `/contests` } });

}