import getUser from "@/lib/user";
import { getEditableTasks } from "../../contests/[contest]/task";
import Link from "next/link";
import style from "./page.module.css";
import { hasProblemMakerPermission } from "../permission";

export default async function Page() {

	const tasks = await getEditableTasks((await getUser())!!.getID()!!);

	const datas: { id: string, name: string, editors: string[], testers: string[] }[] = [];

	for (const value of tasks) {

		datas.push({ id: await value.getID() as string, name: await value.name?.get() as string, editors: await value.editors!!.get() as string[], testers: await value.testers!!.get() as string[] });

	}

	return (
		<>

			<h1>Tasks | AtsuoCoder Admin</h1>

			<table>

				<thead>

					<tr>

						<th>ID</th>
						<th>Name</th>
						<th>Editors</th>
						<th>Testers</th>
						<th>Delete</th>

					</tr>

				</thead>

				<tbody>

					{
						await hasProblemMakerPermission() ?
							<tr>

								<td rowSpan={5}>

									<Link href="/admin/tasks/new">

										Add New

									</Link>

								</td>

							</tr> :
							<></>
					}

					{
						datas.map((task, index) => {

							return (
								<tr key={index}>
									<td><Link href={`/admin/tasks/edit/${task.id}`}>{task.id}</Link></td>
									<td>{task.name}</td>
									<td>{task.editors.join(", ")}</td>
									<td>{task.testers.join(", ")}</td>
									<td><Link href={`/admin/tasks/delete/${task.id}`}><input type="button" value="Delete" style={{ background: "red", width: "fit-content" }} /></Link></td>
								</tr>
							)

						})
					}

				</tbody>

			</table>

		</>
	)

}
