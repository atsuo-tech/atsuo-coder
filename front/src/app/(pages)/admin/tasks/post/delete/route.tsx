import redis from "@/app/redis";
import { sql } from "@/app/sql";
import { NextRequest } from "next/server";
import fs from "fs";
import { hasProblemAdminPermission } from "../../../permission";
import { ResultSetHeader } from "mysql2";
import { getTask } from "@/app/(pages)/contests/[contest]/task";
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

	if(!user) {

		notFound();

	}

	if (typeof data.get("id") != "string") {

		return BadRequest();
	}

	const tasks = await getTask(sql, data.get("id") as string);

	const task = tasks[0];

	if (!await hasProblemAdminPermission() && !task.editor.includes(user.getID()!!)) {

		return Unauthorized();

	}

	const [result] = await sql.query<ResultSetHeader>("DELETE FROM tasks WHERE id = ?", [data.get("id")]);

	if (result.affectedRows == 0) {

		return new Response("Failed to delete", { status: 500 });

	}

	await redis.del(`task:${data.get("id")}`);
	fs.rmSync(`./static/testcases/${data.get("id")}`, { recursive: true });

	return new Response("301", { status: 301, headers: { location: `/admin/tasks` } });

}