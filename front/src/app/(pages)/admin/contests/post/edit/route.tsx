import redis from "@/app/redis";
import { sql } from "@/app/sql";
import { NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { hasContestAdminPermission } from "../../../permission";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";

function Unauthorized() {

	return new Response("Unauthorized", {
		status: 401
	});

}

function BadRequest() {

	return new Response("Bad Request", {
		status: 400
	});

}

export async function POST(req: NextRequest) {

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const data = await req.formData();

	const parseFunc = (str: string) => JSON.stringify(str.split(',').map((value) => value.replace(/[\s\t]/g, "")).filter(Boolean));

	if (typeof data.get("problems") != "string" || typeof data.get("editors") != "string" || typeof data.get("testers") != "string" || typeof data.get("id") != "string") {

		return BadRequest();

	}

	const contest = await getContest(data.get("id") as string);

	if (!contest) {

		notFound();

	}

	if (!await hasContestAdminPermission() && (await contest.editors!!.get()).includes(user.getID()!!)) {

		return Unauthorized();

	}

	await sql.query(
		"UPDATE contests SET name = ?, start = ?, period = ?, problems = ?, editors = ?, testers = ?, description = ?, penalty = ? WHERE id = ?",
		[
			data.get("name"),
			data.get("start"),
			Number(data.get("period")) * 1000 * 60,
			parseFunc(data.get("problems") as string),
			parseFunc(data.get("editors") as string),
			parseFunc(data.get("testers") as string),
			data.get("description"),
			Number(data.get("penalty")),
			data.get("id")
		]
	);

	await redis.del(`contest:${data.get("id")}`);

	return new Response("301", { status: 301, headers: { location: `/contests/${data.get("id")}` } });

}