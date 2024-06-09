import { sql } from "@/app/sql";
import { NextRequest } from "next/server";
import fs from "fs";
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

	if(!user) {

		notFound();

	}

	if (typeof data.get("id") != "string") {

		return BadRequest();
	}

	const task = await getProblem(data.get("id") as string);

	if(!task) {

		return notFound();

	}

	if (!await hasProblemAdminPermission() && !(await task.editors!!.get()).includes(user.getID()!!)) {

		return Unauthorized();

	}

	const [result] = await sql.query<ResultSetHeader>("DELETE FROM tasks WHERE id = ?", [data.get("id")]);

	if (result.affectedRows == 0) {

		return new Response("Failed to delete", { status: 500 });

	}

	fs.rmSync(`./static/testcases/${data.get("id")}`, { recursive: true });

	return new Response("301", { status: 301, headers: { location: `/admin/tasks` } });

}