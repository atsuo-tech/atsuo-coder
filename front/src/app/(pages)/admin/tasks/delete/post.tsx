import styles from "../form.module.css";
import { getTask } from "@/app/(pages)/contests/[contest]/task";
import { sql } from "@/app/sql";
import { notFound } from "next/navigation";
import { hasProblemAdminPermission } from "../../permission";
import getUser from "@/lib/user";

export default async function PostDeleteTask(id: string) {

	const task = await getTask(sql, id);

	if (!task) {

		notFound();

	}

	const user = await getUser();

	if (!user || !await hasProblemAdminPermission() && !task.editors.includes(user.getID()!!)) {

		notFound();

	}

	return (
		<>
			<h1>Delete Task | AtsuoCoder Admin</h1>
			<p>Deleting {id}</p>
			<br />
			<div className={styles.body1}>
				<form action="/admin/tasks/post/delete" method="post">
					<input type="hidden" name="id" defaultValue={id} />
					<p>Are you sure to delete this task <code>{id}</code>?</p>
					<br />
					<input name="check" id="check" type="checkbox" required className={styles.check} />
					<label htmlFor="check">Yes, I&apos;m sure.</label>
					<br />
					<p>Even if you delete the task, it will remain in the cache for a while.</p>
					<br />
					<input type="submit" defaultValue="Delete" className={styles.delete} />
				</form>
			</div>
		</>
	);

}