import { sql } from "@/app/sql";
import submissionsStyle from "./submission.module.css";
import { notFound } from "next/navigation";
import getProblem from "@/lib/problem";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";
import Markdown from "@/components/markdown";
import Editor from "@/components/ace-editor";
import Language from "@/lib/language";
import { RowDataPacket } from "mysql2";

export default async function Page(params: { params: { [key: string]: string } }) {

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const contest = await getContest(params.params.contest);

	if (!contest) {

		notFound();

	}

	let allowUser = true;

	const start = await contest.start!!.get();
	const period = await contest.period!!.get();
	const editors = await contest.editors!!.get();
	const testers = await contest.testers!!.get();

	if (start.getTime() + period > Date.now()) {

		allowUser = false;

	}

	if (user) {

		if (editors.includes(user.getID()!!) || testers.includes(user.getID()!!)) {

			allowUser = true;

		}

	}

	const result = await sql.query<RowDataPacket[]>(`SELECT contest, sourceCode, judge, task, user, language from submissions WHERE id = ? ${allowUser ? "" : "AND user = ?"}`, [params.params.id, user.getID() || undefined]);

	if (Array.from(result[0] as any).length == 0) {

		notFound();

	}

	const { contest: submittedContest, sourceCode, judge, task, user: submittedUser, language } = Array.from(result[0] as any)[0] as any;

	if (submittedContest != params.params.contest) {

		notFound();

	}

	const taskInfo = await getProblem(task);

	if (!taskInfo) {

		notFound();

	}

	const parsedJudge = judge == "WJ" ? {} : JSON.parse(judge);

	const resultStrings = ["AC", "WA", "RE", "CE", "TLE", "OLE", "MLE", "QLE", "IE", "Hack"];

	return (
		<>
			<title><Language>submission</Language> | Atsuo Coder</title>
			<h1><Language>submission</Language> | Atsuo Coder</h1>
			<br />
			<div className={submissionsStyle.root}>
				<h2>
					<Language>code</Language>
					{
						(await contest.editors!!.get()).includes(user.getID()!!) ?
							<a href={`/contests/${params.params.contest}/submissions/${params.params.id}/rejudge`}><button className={submissionsStyle.rejudge}><Language>rejudge</Language></button></a> :
							<></>
					}
				</h2>
				<Editor
					language={
						{
							"cpp23": "c_cpp",
							"python2": "python",
							"python3": "python",
							"nasm": "assembly_x86"
						}[language as "cpp23" | "python2" | "python3" | "nasm"] as "c_cpp" | "python" | "assembly_x86"
					}
					readonly
					value={sourceCode}
				/>
				<br />
				<div className={submissionsStyle.grid1}>
					<div>
						<h2><Language>user</Language></h2>
						<a href={`/users/${submittedUser}`}>{submittedUser}</a>
					</div>
				</div>
				<div className={submissionsStyle.grid}>
					<div>
						<h2>Task</h2>
						<a href={`/contests/${params.params.contest}/tasks/${task}`}>{await taskInfo.name!!.get()}</a>
					</div>
					<div>
						<h2><Language>result</Language></h2>
						{
							judge == "WJ" ?
								<p>Waiting Judge</p> :
								"status" in parsedJudge ?
									<>
										<p className={submissionsStyle[`c-${resultStrings[parsedJudge.status].toLowerCase()}`]}>{resultStrings[parsedJudge.status]}</p>
									</> :
									<>
										<p>
											<span className={submissionsStyle[`c-${resultStrings[parsedJudge[0][0]].toLowerCase()}`]}>
												{resultStrings[parsedJudge[0][0]]}
											</span>
										</p>
										<p>{parsedJudge[0][1]} points</p>
									</>
						}
					</div>
				</div>
				<br />
				<div className={submissionsStyle.code}>
					<h2><Language>compile_error</Language></h2>
					{
						"message" in parsedJudge ?
							<>
								<Markdown md={"```\n" + (parsedJudge.message as string).replace("`", "\\`") + "\n```"} />
							</> :
							<></>
					}
				</div>
				<h2><Language>testcases</Language></h2>
				<br />
				{
					judge != "WJ" && parsedJudge.status != 3 ?
						<table>
							<thead>
								<tr>
									<td><Language>testcase_id</Language></td>
									<td><Language>result</Language></td>
									<td><Language>score</Language></td>
									<td><Language>detail</Language></td>
								</tr>
							</thead>
							<tbody>
								{
									(parsedJudge[1] as [number, number][]).map((v, i) => {
										const judgeDetails: { [result: number]: number } = [];
										let results: number[] = [];
										parsedJudge[2][i].forEach((v: [number, number]) => {
											if (v[0] in judgeDetails) {
												judgeDetails[v[0]]++;
											} else {
												judgeDetails[v[0]] = 1;
												results.push(v[0]);
											}
										});
										results.sort();
										return <tr key={i}>
											<td>{i + 1}</td>
											<td>
												<div className={submissionsStyle[`c-${resultStrings[v[0]].toLowerCase()}`]}>
													{resultStrings[v[0]]}
												</div>
											</td>
											<td>{v[1]} points</td>
											<td>
												{
													results.map((result, i) => {
														return (
															<span key={i} className={submissionsStyle.detailResult}>
																<div className={submissionsStyle[`c-${resultStrings[result].toLowerCase()}`]}>
																	{resultStrings[result]}
																</div> × {judgeDetails[result]}
															</span>
														)
													})
												}
											</td>
										</tr>
									})
								}
							</tbody>
						</table>
						: <></>
				}
			</div>
		</>
	)
}