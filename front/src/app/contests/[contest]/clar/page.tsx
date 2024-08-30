import Markdown from "@/components/markdown";
import User from "@/components/user";
import { Clar, getContestClars } from "@/lib/clar";
import getProblem from "@/lib/problem";
import getUser from "@/lib/user";

export default async function Page({ params: { contest: contest_id } }: { params: { contest: string } }) {

	const user_id = await getUser().then(user => user?.getID());

	const src_clars = await getContestClars(contest_id);

	const clars: Clar[] = [];

	for (let i = 0; i < src_clars.length; i++) {

		const clar = src_clars[i];

		if ((await clar.public!!.get() && await clar.answer!!.get()) || await clar.user!!.get() == user_id) {

			clars.push(clar);

		}

	}

	clars.sort((a, b) => a.created_at!!.get()!! < b.created_at!!.get()!! ? 1 : -1);

	return (
		<>
			<h1>質問</h1>

			<a href={`/contests/${contest_id}/clar/new`}>質問する</a>

			<table>
				<thead>
					<tr>
						<th style={{ width: "10%" }}>日付</th>
						<th style={{ width: "20%" }}>問題</th>
						<th style={{ width: "15%" }}>質問者</th>
						<th style={{ width: "20%" }}>質問内容</th>
						<th style={{ width: "15%" }}>回答者</th>
						<th style={{ width: "20%" }}>回答</th>
					</tr>
				</thead>
				<tbody>

					{
						await Promise.all(clars.map(async (clar, i) => (
							<tr key={i}>
								<td>{(await clar.created_at!!.get()).toLocaleString("ja-jp")}</td>
								<td>{await getProblem(await clar.task!!.get()).then(async (problem) => <a href={`/contest/${contest_id}/tasks/${await problem?.getID()}`}>{await problem?.name?.get()}</a>)}</td>
								<td>{<User>{await clar.user!!.get()}</User>}</td>
								<td>{await clar.question!!.get()}</td>
								{await clar.written_by?.get().then(async (user) => <td colSpan={user ? 1 : 2}>{user ? <User>{user}</User> : "未回答"}</td>)}
								<td>{await clar.answer?.get() || ""}</td>
							</tr>
						)))
					}

				</tbody>
			</table >
		</>
	)

}
