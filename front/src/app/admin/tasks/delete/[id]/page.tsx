import getProblem from "@/lib/problem";
import styles from "../../form.module.css";
import { sql } from "@/app/sql";
import { notFound } from "next/navigation";
import getUser from "@/lib/user";
import { hasProblemAdminPermission } from "../../../../../lib/accounts/permission";
import Form from "@/components/form";

export default async function Page({ params: { id } }: { params: { id: string } }) {

	const task = await getProblem(id);

	if (!task) {

		notFound();

	}

	const user = await getUser();

	if (!user || !await hasProblemAdminPermission() && !(await task.editors!!.get()).includes(user.getID()!!)) {

		notFound();

	}

	return (
		<>
			<h1>Delete Task | AtsuoCoder Admin</h1>
			<p>Deleting {id}</p>
			<Form action="/admin/tasks/post/delete" method="post">
				<input type="hidden" name="id" defaultValue={id} />
				<p>Are you sure to delete this task <code>{id}</code>?</p>
				<input name="check" id="check" type="checkbox" required className={styles.check} />
				<label htmlFor="check">Yes, I&apos;m sure.</label>
				<br />
				<p>Even if you delete the task, it will remain in the cache for a while.</p>
				<input type="submit" defaultValue="Delete" className={styles.delete} />
			</Form>
		</>
	);

}