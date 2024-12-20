import { NextRequest } from "next/server";
import fs from "fs";
import { hasProblemAdminPermission } from "../../../../../lib/accounts/permission";
import getProblem from "@/lib/problem";
import http from "http";
import getUser from "@/lib/user";
import { notFound } from "next/navigation";

export async function POST(req: NextRequest) {

	const data = await req.formData();

	const user = await getUser();

	if (!user) {

		notFound();

	}

	if (typeof data.get("task_id") != "string" || typeof data.get("id") != "string") {

		return new Response("Bad Request", {
			status: 400
		});

	}

	const task = await getProblem(data.get("task_id") as string);

	if (!task) {

		notFound();

	}

	if (!user || !await hasProblemAdminPermission() && !(await task.editors!!.get()).includes(user.getID()!!)) {

		return new Response("Unauthorized", {
			status: 401
		});

	}

	fs.rmSync(`./static/testcases/${data.get("task_id")}/${data.get("id")}`, { recursive: true });

	await new Promise<void>(resolve => http.get(`http://localhost:9834/testcases/${data.get("task_id")}/reload`, (res) => { resolve() }));

	return new Response("301", { status: 301, headers: { location: `/admin/testcases/operate/${data.get("task_id")}` } });

}