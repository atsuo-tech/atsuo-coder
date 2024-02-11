import http from "http";
import { NextRequest } from "next/server";
import fs from "fs";
import { Permissions } from "@/lib/user";
import { getTask } from "@/app/(pages)/contests/[contest]/task";
import { notFound } from "next/navigation";
import { sql } from "@/app/sql";
import getUser from "@/lib/user";

export async function POST(req: NextRequest) {

	const data = await req.formData();

	const user = await getUser();

	if(!user) {

		notFound();

	}

	const tasks = await getTask(sql, data.get("task_id") as string);

	if (tasks.length == 0) {

		notFound();

	}

	const task = tasks[0];

	if (!Permissions.hasPermission(await user.permission!!.get(), Permissions.BasePermissions.ProblemAdmin) && !task.editors.includes(user.getID()!!)) {

		return new Response("Unauthorized", {
			status: 401
		});

	}

	if (typeof data.get("task_id") != "string") {

		return new Response("Bad Request", {
			status: 400
		});

	}

	fs.rmSync(`./static/testcases/${data.get("task_id")}/${data.get("id")}`, { recursive: true });
	fs.mkdirSync(`./static/testcases/${data.get("task_id")}/${data.get("id")}`);
	fs.writeFileSync(`./static/testcases/${data.get("task_id")}/${data.get("id")}/dependencies.json`, "[]");
	const inputs = data.getAll("input") as File[];
	const outputs = data.getAll("output") as File[];

	for (let i = 0; i < inputs.length; i++) {
		fs.mkdirSync(`./static/testcases/${data.get("task_id")}/${data.get("id")}/${inputs[i].name}`);
		fs.writeFileSync(`./static/testcases/${data.get("task_id")}/${data.get("id")}/${inputs[i].name}/in.txt`, await inputs[i].text());
		const output = outputs.find((value) => value.name == inputs[i].name)!!;
		fs.writeFileSync(`./static/testcases/${data.get("task_id")}/${data.get("id")}/${output.name}/out.txt`, await output.text());
		fs.writeFileSync(`./static/testcases/${data.get("task_id")}/${data.get("id")}/${output.name}/config.json`, JSON.stringify({ type: "plane", score: i == 0 ? Number(data.get("score")) : 0 }));
	}

	await new Promise<void>(resolve => http.get(`http://localhost:9834/testcases/${data.get("task_id")}/reload`, (res) => { resolve() }));

	return new Response("301", { status: 301, headers: { location: `/admin/tasks` } });

}