import styles from "../form.module.css";
import getProblem from "@/lib/problem";
import { sql } from "@/app/sql";
import { notFound } from "next/navigation";
import { hasProblemAdminPermission } from "../../../../lib/accounts/permission";
import getUser from "@/lib/user";
import Form from "@/components/form";
import Warning from "@/components/form/warnings";

export default async function PostNewTestcase(id: string) {

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const task = await getProblem(id);

	if (!task || !await hasProblemAdminPermission() && !(await task.editors!!.get()).includes(user.getID()!!)) {

		notFound();

	}

	return (
		<>
			<h1>New Testcase | AtsuoCoder Admin</h1>
			<Form action="/admin/testcases/post/new" method="post">
				<input type="hidden" name="type" defaultValue="new" />
				<label htmlFor="task_id">Task ID</label>
				<br />
				<input type="hidden" name="task_id" defaultValue={id} />
				<input type="text" autoComplete="on" placeholder="aac001_a" required defaultValue={id} disabled />
				<br />
				<label htmlFor="id">ID</label>
				<br />
				<input name="id" id="id" type="text" autoComplete="on" placeholder="test_a" required />
				<br />
				<Warning>
					<ul>
						<li> Warning: Do not include <a href="/reserved.json"><u>reserved strings</u></a>.</li>
					</ul>
				</Warning>
				<br />
				<label htmlFor="score">Score</label>
				<br />
				<input name="score" id="score" type="number" required defaultValue="100" />
				<br />
				<label htmlFor="input">Input ({"{number}"}.txt, multiple selection)</label>
				<br />
				<input name="input" id="input" type="file" required multiple accept=".txt" />
				<br />
				<label htmlFor="input">Output ({"{number}"}.txt, multiple selection)</label>
				<br />
				<input name="output" id="output" type="file" required multiple accept=".txt" />
				<input type="submit" defaultValue="Create" />
			</Form>
		</>
	);

}