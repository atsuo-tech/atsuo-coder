import { sql } from "@/app/sql";
import styles from "./standings.module.css";
import { FieldPacket } from "mysql2";
import { notFound } from "next/navigation";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";
import { ReactNode } from "react";

export default async function Page({ params: { contest: contestId } }: { params: { contest: string } }) {

	const user = await getUser();

	const contest = await getContest(contestId);
	if (!contest) notFound();

	if ((await contest.start!!.get()).getTime() > Date.now()) {

		if (user && !(await contest.editors!!.get()).includes(user.getID()!!) && !(await contest.testers!!.get()).includes(user.getID()!!)) notFound();
		if (!user) notFound();

	}

	const [submissions, _] = await sql.query("SELECT * FROM submissions WHERE contest = ? ORDER BY created_at", [contestId]) as [{ id: string, sourceCode: string, contest: string, task: string, user: string, created_at: Date, judge: string, language: string }[], FieldPacket[]];

	const scores: { [user: string]: { score: number, problems: { [problem: string]: number } } } = {};

	for (let i = 0; i < submissions.length; i++) {

		if (submissions[i].judge == "WJ" || JSON.parse(submissions[i].judge).status == 3) continue;
		scores[submissions[i].user] = scores[submissions[i].user] || { score: 0, problems: {} };
		scores[submissions[i].user].problems[submissions[i].task] = Math.max(scores[submissions[i].user].problems[submissions[i].task] || 0, JSON.parse(submissions[i].judge)[0][1]);

	}

	const users: [number, string][] = [];

	for (const user in scores) {
		for (const problem in scores[user].problems) {
			scores[user].score += scores[user].problems[problem];
		}
		users.push([scores[user].score, user]);
	}

	users.sort((a, b) => b[0] - a[0]);

	return (
		<>
			<h1>Standings | AtsuoCoder</h1>
			<table>
				<thead>
					<tr>
						<td className={styles.user}>User</td>
						<td className={styles.user}>Total</td>
						{
							(await contest.problems!!.get()).map((problem, i) => {
								return (
									<td key={i}><a href={`/contests/${contestId}/tasks/${problem}`}>{problem}</a></td>
								)
							})
						}
					</tr>
				</thead>
				<tbody>
					{
						await (async () => {

							let nodes: ReactNode[] = [];
							let i = 0;

							for (const user of users) {

								nodes.push(
									<tr key={i}>
										<td className={styles.user}>{user[1]}</td>
										<td className={styles.user}>{scores[user[1]].score}</td>
										{
											(await contest.problems!!.get()).map((problem, j) => {
												return (
													<td key={j}>{scores[user[1]].problems[problem] || 0}</td>
												)
											})
										}
									</tr>
								);

								i++;

							}

							return nodes;

						})()
					}
				</tbody>
			</table>
		</>
	)

}