import { sql } from "@/app/sql";
import { NextRequest } from "next/server";
import { hasContestMakerPermission } from "../../../permission";
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

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const data = await req.formData();

	const parseFunc = (str: string) => JSON.stringify(str.split(',').map((value) => value.replace(/[\s\t]/g, "")).filter(Boolean));

	if (!await hasContestMakerPermission()) {

		return Unauthorized();

	}

	if (typeof data.get("problems") != "string" || typeof data.get("editors") != "string" || typeof data.get("testers") != "string") {

		return BadRequest();

	}

	const [result] = await sql.query<ResultSetHeader>("INSERT INTO contests (name, id, start, period, problems, editors, testers, rated_users, unrated_users, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		[
			data.get("name"),
			data.get("id"),
			data.get("start"),
			Number(data.get("period")) * 1000 * 60,
			parseFunc(data.get("problems") as string),
			parseFunc(data.get("editors") as string),
			parseFunc(data.get("testers") as string),
			"[]", "[]",
			data.get("description")
		]
	);

	if (result.affectedRows == 0) {

		return new Response("Failed to insert", { status: 500 });

	}

	return new Response("301", { status: 301, headers: { location: `/contests/${data.get("id")}` } });

}