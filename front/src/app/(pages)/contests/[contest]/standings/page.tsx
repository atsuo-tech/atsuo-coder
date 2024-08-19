import { sql } from "@/app/sql";
import styles from "./standings.module.css";
import { FieldPacket } from "mysql2";
import { notFound } from "next/navigation";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";
import { ReactNode } from "react";
import getProblem from "@/lib/problem";

export default async function Page({ params: { contest: contestId } }: { params: { contest: string } }) {

	const user = await getUser();

	const contest = await getContest(contestId);
	if (!contest) notFound();

	const [submissions, _] = await sql.query("SELECT * FROM submissions WHERE contest = ? ORDER BY created_at", [contestId]) as [{ id: string, sourceCode: string, contest: string, task: string, user: string, created_at: Date, judge: string, language: string }[], FieldPacket[]];

	const scores: { [user: string]: { score: number, problems: { [problem: string]: { score: number, penalty: number, notEffectedPenalty: number, lastSubmitTime: number } } } } = {};

	for (let i = 0; i < submissions.length; i++) {

		if (submissions[i].created_at.getTime() < (await contest.start!!.get()).getTime() || submissions[i].created_at.getTime() > (await contest.start!!.get()).getTime() + (await contest.period!!.get())) continue;

		if (submissions[i].judge == "WJ" || JSON.parse(submissions[i].judge).status == 3) continue;
		scores[submissions[i].user] = scores[submissions[i].user] || { score: 0, problems: {} };

		if (!scores[submissions[i].user].problems[submissions[i].task]) {

			scores[submissions[i].user].problems[submissions[i].task] = { lastSubmitTime: 0, notEffectedPenalty: 0, penalty: 0, score: 0 };

		}

		if (scores[submissions[i].user].problems[submissions[i].task].score < JSON.parse(submissions[i].judge)[0][1]) {

			scores[submissions[i].user].problems[submissions[i].task].penalty += scores[submissions[i].user].problems[submissions[i].task].notEffectedPenalty || 0;
			scores[submissions[i].user].problems[submissions[i].task].lastSubmitTime = submissions[i].created_at.getTime() - (await contest.start!!.get()).getTime();
			scores[submissions[i].user].problems[submissions[i].task].score = JSON.parse(submissions[i].judge)[0][1];
			scores[submissions[i].user].problems[submissions[i].task].notEffectedPenalty = 1;

		} else {

			scores[submissions[i].user].problems[submissions[i].task].notEffectedPenalty = (scores[submissions[i].user].problems[submissions[i].task].notEffectedPenalty || 0) + 1;

		}

	}

	let users: { user: string, score: number, contestTime: number, rating: number }[] = [];

	for (const user in scores) {

		let lastSubmitTime = 0;
		let penalty = 0;

		for (const problem in scores[user].problems) {

			scores[user].score += scores[user].problems[problem].score;
			penalty += scores[user].problems[problem].penalty;
			lastSubmitTime = Math.max(lastSubmitTime, scores[user].problems[problem].lastSubmitTime);

		}

		users.push({ user, score: scores[user].score, contestTime: lastSubmitTime + (await contest.penalty!!.get()) * 1000 * 60 * penalty, rating: await (await getUser(user))!!.rating!!.get()!! });

	}

	const rated_users = await contest.rated_users!!.get();
	const unrated_users = await contest.unrated_users!!.get();

	const registerd_users = rated_users.concat(unrated_users);

	users = users.filter((user) => registerd_users.includes(user.user));

	await Promise.all(

		registerd_users.filter((user) => !users.find((value) => value.user == user)).map(async (user) => {

			users.push({ user, score: 0, contestTime: 0, rating: await (await getUser(user))!!.rating!!.get()!! });

		})

	);

	users.sort((a, b) => (b.score - a.score == 0 ? a.contestTime - b.contestTime : b.score - a.score));

	return (
		<>
			<h1>Standings | AtsuoCoder</h1>

			<div>

				<table>
					<thead>
						<tr>
							<td className={styles.rank_column}>#</td>
							<td>User</td>
							<td className={styles.score_column}>Total</td>
							<td className={styles.score_column}>Penalty</td>
							{
								await Promise.all((await contest.problems!!.get()).map(async (problem, i) => {

									const task = await getProblem(problem);

									return (
										<td key={i} className={styles.score_column}><a href={`/contests/${contestId}/tasks/${problem}`}>{((await task!!.name!!.get()).includes(".") && (await task!!.name!!.get()).split(".")?.[0]) || String.fromCharCode(65 + i)}</a></td>
									)

								}))
							}
						</tr>
					</thead>
					<tbody>
						{
							await (async () => {

								let nodes: ReactNode[] = [];
								let i = 0;

								for (const user of users) {

									if (!scores[user.user]) {
										scores[user.user] = { score: 0, problems: {} };
									}

									let penaltySum = 0;

									for (const problem in scores[user.user].problems) {

										penaltySum += scores[user.user].problems[problem].penalty;

									}

									let lastSubmitTime = 0;

									for (const problem in scores[user.user].problems) {

										lastSubmitTime = Math.max(lastSubmitTime, scores[user.user].problems[problem].lastSubmitTime);

									}

									nodes.push(
										<tr key={i} className={styles.tabler}>
											<td>{i + 1}</td>
											<td className={styles.user}><p className={!user.rating || user.rating == 0 ? undefined : `rating${Math.min(7, Math.floor(user.rating / 400))}`}>{user.user}</p></td>
											<td className={styles.score_column}>
												{(scores[user.user]?.score == 0) ?
													<p className={styles.passage}> - </p> :
													<>
														<p className={styles.score_total}>{scores[user.user]?.score}</p>
														<p className={styles.submit_time}>{new Date(lastSubmitTime - 9 * 3600 * 1000).toLocaleTimeString("ja-jp")}</p>
													</>
												}
											</td>
											{
												(penaltySum == 0) ?
													<td>-</td> :
													<td className={styles.penalty}>+{penaltySum}</td>
											}
											{
												(await contest.problems!!.get()).map((problem, j) => {
													if (!scores[user.user].problems[problem]) {
														scores[user.user].problems[problem] = { lastSubmitTime: 0, notEffectedPenalty: 0, penalty: 0, score: 0 };
													}
													return (
														<td key={j} className={styles.score_column}>
															{(scores[user.user].problems[problem].score == 0) ?
																<p className={styles.passage}> - </p> :
																<>
																	<p className={styles.score}>{scores[user.user].problems[problem].score}</p>
																	<p className={styles.submit_time}>{new Date(scores[user.user].problems[problem].lastSubmitTime - 9 * 3600 * 1000).toLocaleTimeString("ja-jp")}</p>
																</>
															}
														</td>
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

			</div>

		</>
	)

}
