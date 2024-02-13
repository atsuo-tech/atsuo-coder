import redis from "@/app/redis";
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

	await Promise.all([
		contest.name!!.set(data.get("name") as string),
		contest.start!!.set(new Date(data.get("start") as string)),
		contest.period!!.set(Number(data.get("period")) * 1000 * 60),
		contest.problems!!.set((data.get("problems") as string).split(',').map((val) => val.replace(/[\s\t]/g, ""))),
		contest.editors!!.set((data.get("editors") as string).split(',').map((val) => val.replace(/[\s\t]/g, ""))),
		contest.testers!!.set((data.get("testers") as string).split(',').map((val) => val.replace(/[\s\t]/g, ""))),
		contest.description!!.set(data.get("description") as string),
		contest.penalty!!.set(Number(data.get("penalty")))
	]);

	await redis.del(`contest:${data.get("id")}`);

	return new Response("301", { status: 301, headers: { location: `/contests/${data.get("id")}` } });

}