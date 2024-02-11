import styles from "../form.module.css";
import { getTask } from "@/app/(pages)/contests/[contest]/task";
import { sql } from "@/app/sql";
import fs from "fs";
import { notFound } from "next/navigation";
import { hasProblemAdminPermission } from "../../permission";
import getUser from "@/lib/user";

export default async function PostDeleteTestcase(task_id: string, id: string) {

	const tasks = await getTask(sql, task_id);

	if (tasks.length == 0) {

		notFound();

	}

	const task = tasks[0];

	const user = await getUser();

	if (!user) {

		notFound();

	}


	if (!await hasProblemAdminPermission() && !task.editors.includes(user.getID()!!)) {

		notFound();

	}

	if (!(fs.statSync(`./static/testcases/${task_id}/${id}`, { throwIfNoEntry: false })?.isDirectory())) {

		notFound();

	}

	return (
		<>
			<h1>Delete Testcase | AtsuoCoder Admin</h1>
			<br />
			<div className={styles.body1}>
				<form action="/admin/testcases/post" method="post" encType="multipart/form-data">
					<input type="hidden" name="type" defaultValue="delete" />
					<label htmlFor="task_id">Task ID</label>
					<br />
					<input name="task_id" type="hidden" defaultValue={task_id} />
					<input id="task_id" type="text" autoComplete="on" placeholder="aac001_a" required defaultValue={task_id} disabled />
					<br />
					<label htmlFor="id">ID</label>
					<br />
					<input type="hidden" name="id" defaultValue={id} />
					<input type="text" id="id" defaultValue={id} disabled />
					<p>Are you sure to delete this testcase <code>{task_id}/{id}</code>?</p>
					<br />
					<input name="check" id="check" type="checkbox" required className={styles.check} />
					<label htmlFor="check">Yes, I&apos;m sure.</label>
					<br />
					<input type="submit" defaultValue="Delete" className={styles.delete} />
				</form>
			</div>
		</>
	);

}