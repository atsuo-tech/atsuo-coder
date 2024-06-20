import { sql } from "@/app/sql";
import { NextRequest } from "next/server";
import { hasProblemAdminPermission } from "../../../permission";
import { ResultSetHeader } from "mysql2";
import getProblem from "@/lib/problem";
import getUser from "@/lib/user";
import { notFound } from "next/navigation";

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

	const data = await req.formData();

	const user = await getUser();

	if (!user) {

		notFound();

	}

	if (typeof data.get("editors") != "string" || typeof data.get("testers") != "string" || typeof data.get("id") != "string") {

		return BadRequest();

	}

	const task = await getProblem(data.get("id") as string);

	if (!task) {

		notFound();

	}

	if (!await hasProblemAdminPermission() && !(await task.editors!!.get()).includes(user.getID()!!)) {

		return Unauthorized();

	}

	await Promise.all([
		task.name!!.set(data.get("name") as string),
		task.question!!.set(data.get("question") as string),
		task.editors!!.set((data.get("editors") as string).split(",").map((value) => value.replace(/[\s\t]/g, "")).filter(Boolean)),
		task.testers!!.set((data.get("testers") as string).split(",").map((value) => value.replace(/[\s\t]/g, "")).filter(Boolean))
	]);

	return new Response("301", { status: 301, headers: { location: `/admin/tasks` } });

}