import User from "@/components/user";
import { Clar, getContestClars } from "@/lib/clar";
import { getManagaedContests } from "@/lib/contest";
import getProblem from "@/lib/problem";
import getUser from "@/lib/user";
import { notFound } from "next/navigation";

export default async function Page() {

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const contests = await getManagaedContests(user.getID()!!);

	let clars: Clar[] = [];

	for (const contest of contests) {

		clars = clars.concat(await getContestClars(contest!!.id!!).then((clars) => clars.map((clar) => clar!!)));

	}

	return (
		<>
			<h1>Clars</h1>

			<table>

				<thead>

					<tr>

						<th style={{ width: "10%" }}>日付</th>
						<th style={{ width: "15%" }}>問題</th>
						<th style={{ width: "15%" }}>質問者</th>
						<th style={{ width: "15%" }}>質問内容</th>
						<th style={{ width: "15%" }}>回答者</th>
						<th style={{ width: "20%" }}>回答</th>
						<th style={{ width: "10%" }}>編集</th>

					</tr>

				</thead>

				<tbody>

					{
						await Promise.all(
							clars.map(async (clar, i) =>

								<tr key={i}>
									<td>{(await clar.created_at!!.get()).toLocaleString("ja-jp")}</td>
									<td><a href={`/contests/${clar.contest!!.get()}/tasks/${clar.task!!.get()}`}>{await getProblem(await clar.task!!.get()).then((task) => task!!.name!!.get())}</a></td>
									<td><User>{await clar.user!!.get()}</User></td>
									<td>{await clar.question!!.get()}</td>
									{await clar.answer!!.get()
										?
										<>
											<td><User>{await clar.written_by!!.get().then((value) => value!!)}</User></td>
											<td>{await clar.answer!!.get()}</td>
										</>
										: <td colSpan={2}>未回答</td>
									}
									<td><a href={`/contests/${await clar.contest!!.get()}/clar/answer/${clar.id}`}>編集</a></td>
								</tr>

							)
						).then((rows) => rows.length == 0 ? <tr><td colSpan={7}>No Data</td></tr> : rows)
					}

				</tbody>

			</table >
		</>
	)

}
