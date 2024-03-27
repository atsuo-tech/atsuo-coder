import { sql } from "@/app/sql";
import { notFound } from "next/navigation";
import { getTask } from "../../task";
import crypto from "crypto";

import submitStyle from "./task.module.css";
import React from 'react';

import Markdown from "@/components/markdown";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";

export default async function Page(p: { params: { contest: string, task: string } }) {

	let user = await getUser();

	if (!user) {

		notFound();

	}

	const contest = await getContest(p.params.contest);

	if (!contest) {

		notFound();

	}

	const problems = await contest.problems!!.get();

	if (problems.indexOf(p.params.task) == -1) {

		notFound();

	}

	const taskInfo = await getTask(sql, p.params.task);

	if(!taskInfo) {

		notFound();

	}

	const ct_token = crypto.randomUUID();
	await sql.query("INSERT INTO ct_token (id, use_to, created_at, user_id) VALUES (?, ?, now(), ?);", [ct_token, "SUBMIT", user.getID()]);

	return (
		<>
			<title>{taskInfo.name}</title>
			<h1>{taskInfo.name}</h1>
			<p>
				Editors: {taskInfo.editors} Testers: {taskInfo.testers.length == 0 ? "なし" : taskInfo.testers}<br />
				Score: {taskInfo.score}
			</p>
			<div className={submitStyle.task}>
				<div id="task">
					<Markdown md={taskInfo.question} />
				</div>
			</div >

			<div id="submit" className={submitStyle.submit}>
				<iframe src={`/frame/submit?contest=${p.params.contest}&task=${p.params.task}&language=cpp23&csrf=${ct_token}`} id="submit-frame" className={submitStyle.frame}></iframe>
			</div>
		</>
	)
}
