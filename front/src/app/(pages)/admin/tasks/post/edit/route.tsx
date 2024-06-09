import redis from "@/app/redis";
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

	const parseFunc = (str: string) => JSON.stringify(str.split(',').map((value) => value.replace(/[\s\t]/g, "")).filter(Boolean));

	if (typeof data.get("editors") != "string" || typeof data.get("testers") != "string" || typeof data.get("id") != "string") {

		return BadRequest();

	}

	const task = await getProblem(data.get("id") as string);

	if(!task) {

		notFound();

	}

	if (!await hasProblemAdminPermission() && !(await task.editors!!.get()).includes(user.getID()!!)) {

		return Unauthorized();

	}

	const [result] = await sql.query<ResultSetHeader>("UPDATE tasks SET name = ?, question = ?, editors = ?, testers = ? WHERE id = ?", [data.get("name"), data.get("question"), parseFunc(data.get("editors") as string), parseFunc(data.get("testers") as string), data.get("id")]);

	if (result.affectedRows == 0) {

		return new Response("Failed to update", { status: 500 });

	}

	await redis.del(`task:${data.get("id")}`);

	return new Response("301", { status: 301, headers: { location: `/admin/tasks` } });

}