import { getEditableProblems } from "@/lib/problem";
import getUser from "@/lib/user";

export default async function Page() {

	const user = await getUser();
	const tasks = await getEditableProblems(user!!.getID()!!);

	const datas: { id: string, name: string }[] = [];

	for (const value of tasks) {

		if (!value) continue;

		const id = await value.getID() as string;

		datas.push({
			id,
			name: await value.name?.get() as string,
		});

	}

	return (
		<>
			<h1>Testcases | AtsuoCoder Admin</h1>
			<p>追加・編集・削除するテストケースの問題を選んでください。</p>
			<table>

				<thead>

					<tr>

						<th>ID</th>
						<th>問題名</th>
						<th>操作</th>

					</tr>

				</thead>

				<tbody>

					{
						datas.map((task, index) => {

							return (
								<tr key={index}>
									<td>{task.id}</td>
									<td>{task.name}</td>
									<td>
										<a href={`/admin/testcases/operate/${task.id}`}>
											操作
										</a>
									</td>
								</tr>
							)

						})
					}

				</tbody>

			</table>
		</>
	)
}