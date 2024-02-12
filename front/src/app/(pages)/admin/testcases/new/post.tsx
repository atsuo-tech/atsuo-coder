import styles from "../form.module.css";
import { getTask } from "@/app/(pages)/contests/[contest]/task";
import { sql } from "@/app/sql";
import { notFound } from "next/navigation";
import { hasProblemAdminPermission } from "../../permission";
import getUser from "@/lib/user";

export default async function PostNewTestcase(id: string) {

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const task = await getTask(sql, id);

	if (task.length == 0 || !await hasProblemAdminPermission() && !task[0].editors.includes(user.getID()!!)) {

		notFound();

	}

	return (
		<>
			<h1>New Testcase | AtsuoCoder Admin</h1>
			<div className={styles.body1}>
				<form action="/admin/testcases/post/new" method="post" encType="multipart/form-data">
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
					<label htmlFor="id" className={`${styles.warning} ${styles.show}`} id="id-warning">
						<ul>
							<li> Warning: Do not include <a href="/reserved.json"><u>reserved strings</u></a>.</li>
						</ul>
					</label>
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
				</form>
			</div>
		</>
	);

}