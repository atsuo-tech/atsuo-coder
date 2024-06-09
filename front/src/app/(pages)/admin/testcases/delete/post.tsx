import styles from "../form.module.css";
import getProblem from "@/lib/problem";
import { sql } from "@/app/sql";
import fs from "fs";
import { notFound } from "next/navigation";
import { hasProblemAdminPermission } from "../../permission";
import getUser from "@/lib/user";
import Form from "@/components/form";

export default async function PostDeleteTestcase(task_id: string, id: string) {

	const task = await getProblem(task_id);

	if (!task) {

		notFound();

	}

	const user = await getUser();

	if (!user) {

		notFound();

	}


	if (!await hasProblemAdminPermission() && !(await task.editors!!.get()).includes(user.getID()!!)) {

		notFound();

	}

	if (!(fs.statSync(`./static/testcases/${task_id}/${id}`, { throwIfNoEntry: false })?.isDirectory())) {

		notFound();

	}

	return (
		<>
			<h1>Delete Testcase | AtsuoCoder Admin</h1>
			<br />
			<Form action="/admin/testcases/post/delete" method="post">
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
			</Form>
		</>
	);

}