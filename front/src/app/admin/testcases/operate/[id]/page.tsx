import { hasAdminPremission, hasProblemAdminPermission } from "@/lib/accounts/permission";
import getProblem from "@/lib/problem";
import getUser from "@/lib/user";
import fs from "fs";
import { notFound } from "next/navigation";

export default async function Operate({ params: { id } }: { params: { id: string } }) {

	const user = await getUser()!!;
	const task = await getProblem(id);

	if (!task || !user || (!hasAdminPremission() && !hasProblemAdminPermission() && !(await task.editors!!.get()).includes(user.getID()!!))) {

		notFound();

	}

	const testcases = fs.readdirSync(`./static/testcases/${id}`);

	return (
		<div>
			<h1>テストケース操作</h1>
			<p>編集中：{await task.name?.get()} ({await task.getID()})</p>
			<table>
				<thead>
					<tr>
						<th>テストケースID</th>
						<th>ケース数</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td colSpan={3}>
							<a href={`/admin/testcases/operate/${id}/new`}>
								<span className="material-icons">add</span>
								新規作成
							</a>
						</td>
					</tr>
					{
						testcases.map((testcase, index) => {
							return (
								<tr key={index}>
									<td>{testcase}</td>
									<td>{fs.readdirSync(`./static/testcases/${id}/${testcase}`).length - 1}</td>
									<td>
										<a href={`/admin/testcases/operate/${id}/${testcase}/edit`}>
											<span className="material-icons">edit</span>
										</a>
										<a href={`/admin/testcases/operate/${id}/${testcase}/delete`}>
											<span className="material-icons">delete</span>
										</a>
									</td>
								</tr>
							)
						})
					}
				</tbody>
			</table>
		</div>
	)

}