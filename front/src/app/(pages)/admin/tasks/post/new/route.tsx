import { sql } from "@/app/sql";
import { NextRequest } from "next/server";
import fs from "fs";
import { hasProblemMakerPermission } from "../../../permission";
import { ResultSetHeader } from "mysql2";
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

	if (!await hasProblemMakerPermission()) {

		return Unauthorized();

	}

	if (typeof data.get("editors") != "string" || typeof data.get("testers") != "string") {

		return BadRequest();

	}

	const parseFunc = (str: string) => JSON.stringify(str.split(',').map((value) => value.replace(/[\s\t]/g, "")).filter(Boolean));

	const [result] = await sql.query<ResultSetHeader>(
		"INSERT INTO tasks (name, id, question, editors, testers, score) VALUES (?, ?, ?, ?, ?, ?)",
		[
			data.get("name"),
			data.get("id"),
			data.get("question"),
			parseFunc(data.get("editors") as string),
			parseFunc(data.get("testers") as string),
			0
		]
	);

	if (result.affectedRows == 0) {

		return new Response("Failed to insert", {
			status: 500
		});

	}

	fs.mkdirSync(`./static/testcases/${data.get("id")}`);
	fs.mkdirSync(`./static/editorials/${data.get("id")}`);

	return new Response("301", { status: 301, headers: { location: `/admin/tasks` } });

}