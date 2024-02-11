import { NextRequest } from "next/server";
import fs from "fs";
import { hasProblemAdminPermission } from "../../../permission";
import { getTask } from "@/app/(pages)/contests/[contest]/task";
import { sql } from "@/app/sql";
import getUser from "@/lib/user";
import { notFound } from "next/navigation";

export async function POST(req: NextRequest) {

	const data = await req.formData();

	const user = await getUser();

	if(!user) {

		notFound();

	}

	if (typeof data.get("task_id") != "string" || typeof data.get("id") != "string") {

		return new Response("Bad Request", {
			status: 400
		});

	}

	const task = await getTask(sql, data.get("task_id") as string);

	if (!user || !await hasProblemAdminPermission() && !task[0].editor.includes(user.getID()!!)) {

		return new Response("Unauthorized", {
			status: 401
		});

	}

	fs.rmSync(`./static/testcases/${data.get("task_id")}/${data.get("id")}`, { recursive: true });

	return new Response("301", { status: 301, headers: { location: `/admin/testcases` } });

}