import getUser from "@/lib/user";
import { getEditableProblems } from "@/lib/problem";
import Link from "next/link";
import { hasProblemMakerPermission } from "../../../lib/accounts/permission";
import getContest, { Contest, getAllContests } from "@/lib/contest";

export default async function Page() {

	const contests = await getAllContests();
	const tasks = await getEditableProblems((await getUser())!!.getID()!!);

	const datas: { [key: string]: { id: string, name: string, editors: string[], testers: string[] } } = {};

	for (const value of tasks) {

		if (!value) continue;

		datas[(await value.getID())!!] = { id: await value.getID() as string, name: await value.name?.get() as string, editors: await value.editors!!.get() as string[], testers: await value.testers!!.get() as string[] };

	}

	return (
		<>

			<h1>Tasks | AtsuoCoder Admin</h1>

			<div>

				{
					await hasProblemMakerPermission() ?

						<Link href="/admin/tasks/new">

							Add New

						</Link> :
						<></>
				}

				{
					contests.map(async (contest_id, i) => {
						const contest = await getContest(contest_id) as Contest;
						const tasks = await contest.tasks!!.get()!!;
						let found = false;
						const tasksHTML = (
							<table>

								<thead>

									<tr>

										<th>ID</th>
										<th>名前</th>
										<th>編集者</th>
										<th>テスター</th>
										<th>操作</th>

									</tr>

								</thead>

								<tbody>
									{
										await Promise.all(
											tasks.map((id, i) => {
												const task = datas[id];
												if (!task) return <></>;
												found = true;
												return (
													<tr key={i}>
														<td>{task.id}</td>
														<td>{task.name}</td>
														<td>{task.editors.join(", ")}</td>
														<td>{task.testers.join(", ")}</td>
														<td>
															<Link href={`/admin/tasks/edit/${task.id}`}>
																<span className="material-icons">edit</span>
															</Link>
															<Link href={`/admin/tasks/delete/${task.id}`}>
																<span className="material-icons">delete</span>
															</Link>
														</td>
													</tr>
												)
											})
										)
									}
								</tbody>
							</table>

						);

						if (!found) return <></>;
						return (
							<div key={i}>
								<h2>{await contest.name?.get()} ({contest_id})</h2>
								{tasksHTML}
							</div>
						)
					})
				}

			</div>

		</>
	)

}
