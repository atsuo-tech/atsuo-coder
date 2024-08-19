import { sql } from "@/app/sql";
import styles from "./[id]/submission.module.css";
import { FieldPacket } from "mysql2";
import { notFound } from "next/navigation";
import getUser, { Permissions } from "@/lib/user";
import getContest, { Contest } from "@/lib/contest";
import { hasContestAdminPermission } from "@/app/(pages)/admin/permission";
import Language from "@/lib/language";
import getProblem from "@/lib/problem";

export default async function Page({ params }: { params: { [key: string]: string } }) {

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const resultStrings = ["AC", "WA", "RE", "CE", "TLE", "OLE", "MLE", "QLE", "IE"];

	const contest = await getContest(params.contest) as Contest;

	const start = await contest.start!!.get();
	const period = await contest.period!!.get();
	const rated_users = await contest.rated_users!!.get();
	const unrated_users = await contest.unrated_users!!.get();
	const editors = await contest.editors!!.get();
	const testers = await contest.testers!!.get();

	if (start.getTime() + period > Date.now()) {

		if (!(await hasContestAdminPermission()) && editors.indexOf(user.getID()!!) == -1 && testers.indexOf(user.getID()!!) == -1 && rated_users.indexOf(user.getID()!!) == -1 && unrated_users.indexOf(user.getID()!!) == -1) {

			notFound();

		}

	}

	const submissions = await (async () => {

		if (editors.includes(user.getID()!!) || testers.includes(user.getID()!!)) {

			return (await sql.query("SELECT id, task, user, created_at, judge, language FROM submissions WHERE contest = ? ORDER BY created_at DESC", [params.contest]) as [{ id: string, task: string, created_at: Date, judge: string, language: string, user: string }[], FieldPacket[]])[0];

		} else {

			return (await sql.query("SELECT id, task, user, created_at, judge, language FROM submissions WHERE contest = ? AND user = ? ORDER BY created_at DESC", [params.contest, user.getID()!!]) as [{ id: string, task: string, created_at: Date, judge: string, language: string, user: string }[], FieldPacket[]])[0];

		}

	})();

	const names: { [id: string]: string } = {};

	return (
		<>
			<h1>提出一覧 | AtsuoCoder</h1>
			<h2><Language>submissions</Language></h2>

			<div>

				<table>
					<thead>
						<tr>
							<td width="5%"><Language>index</Language></td>
							<td width="20%"><Language>time</Language></td>
							<td width="20%"><Language>user</Language></td>
							<td width="35%"><Language>task</Language></td>
							<td width="10%"><Language>judge</Language></td>
							<td width="10%"><Language>detail</Language></td>
						</tr>
					</thead>
					<tbody id="submissions">
						{
							await Promise.all(submissions.map(async (submission, i) => {
								const result = submission.judge == "WJ" ? "WJ" : JSON.parse(submission.judge).status == 3 ? "CE" : resultStrings[JSON.parse(submission.judge)[0][0]];
								return <tr key={i}>
									<td>{submissions.length - i}</td>
									<td>{submission.created_at.toLocaleString("ja")}</td>
									<td>{submission.user}</td>
									<td><a href={`/contests/${params.contest}/tasks/${submission.task}`}>
										{

											await (async () => {

												if (submission.task in names) return names[submission.task];

												const task = await getProblem(submission.task);

												return names[submission.task] = await task!!.name!!.get();

											})()
										}
									</a></td>
									<td><p className={styles[`c-${result.toLowerCase()}`]}>{result}</p></td>
									<td><a href={`/contests/${params.contest}/submissions/${submission.id}`}><Language>detail</Language></a></td>
								</tr>
							}))
						}
					</tbody>
				</table>

			</div>

		</>
	);
}