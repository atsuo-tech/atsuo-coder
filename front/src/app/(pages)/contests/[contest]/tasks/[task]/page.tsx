import { sql } from "@/app/sql";
import { notFound } from "next/navigation";
import getProblem from "@/lib/problem";
import crypto from "crypto";

import submitStyle from "./task.module.css";
import React from 'react';

import Markdown from "@/components/markdown";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";
import Link from "next/link";

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

	const taskInfo = await getProblem(p.params.task);

	if (!taskInfo) {

		notFound();

	}

	const data = await taskInfo.getData();

	const ct_token = crypto.randomUUID();
	await sql.query("INSERT INTO ct_token (id, use_to, created_at, user_id) VALUES (?, ?, now(), ?);", [ct_token, "SUBMIT", user.getID()]);

	const isEditor = (await contest.editors!!.get()).includes(user.getID()!!);
	const isTester = (await contest.testers!!.get()).includes(user.getID()!!);

	const period = await contest.period!!.get();
	const start = await contest.start!!.get();

	// コンテスト終了後か
	const contestEnded = period != -1 && (start.getTime() + period < Date.now());

	// 運営か
	const isManager = isEditor || isTester;

	return (
		<>
			<title>{data.name}</title>
			<h1>{data.name}</h1>
			<p>
				Editors: {data.editors} Testers: {data.testers.length == 0 ? "なし" : data.testers}<br />
				Score: {data.score.toString()}
			</p>
			{
				contestEnded || isManager ?
					<>
						<h2>解説</h2>
						<Link href={`/contests/${p.params.contest}/tasks/${p.params.task}/editorial`}>解説を見る</Link>
					</> :
					<></>
			}
			<div className={submitStyle.task}>
				<div id="task">
					<Markdown md={data.question} />
				</div>
			</div >

			<div id="submit" className={submitStyle.submit}>
				<iframe src={`/frame/submit?contest=${p.params.contest}&task=${p.params.task}&language=cpp23&csrf=${ct_token}`} id="submit-frame" className={submitStyle.frame}></iframe>
			</div>
		</>
	)
}
