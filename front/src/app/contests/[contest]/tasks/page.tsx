import { sql } from "@/app/sql";
import { notFound } from "next/navigation";
import { getTasks } from "./@component/contests";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";
import Language from "@/lib/languages";

export default async function Page(p: { params: { contest: string } }) {

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const contest = await getContest(p.params.contest);

	if (!contest) {

		notFound();

	}

	const problems = await contest.problems!!.get();

	const tasks = await getTasks(sql, problems);

	return (
		<>
			<h1><Language>tasks</Language> | AtsuoCoder</h1>

			<div>

				<table>
					<thead>
						<tr>
							<td><Language>task_name</Language></td>
							<td><Language>perfect_score</Language></td>
							<td><Language>editors</Language></td>
						</tr>
					</thead>
					<tbody>
						{problems.map((v, i) => {
							const task = tasks.find((t) => t.id == v);
							return <>
								<tr>
									<td>
										<a href={`/contests/${p.params.contest}/tasks/${task!!.id}`}>{task!!.name}</a>
									</td>
									<td>
										{task!!.score}
									</td>
									<td>
										{task!!.editors.join(" ")}
									</td>
								</tr>
							</>;
						})}
					</tbody>
				</table>

			</div>

		</>
	)

}
