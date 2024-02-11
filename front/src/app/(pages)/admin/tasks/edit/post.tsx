import styles from "../form.module.css";
import { getTask } from "@/app/(pages)/contests/[contest]/task";
import { sql } from "@/app/sql";
import { notFound } from "next/navigation";
import { hasProblemAdminPermission } from "../../permission";
import getUser from "@/lib/user";

export default async function PostEditTask(id: string) {

	const user = await getUser();
	
	const tasks = await getTask(sql, id);

	if (tasks.length == 0 || !user) {

		notFound();

	}

	const task = tasks[0];

	if(!hasProblemAdminPermission() && !task.editor.includes(user.getID()!!)) {

		notFound();

	}

	return (
		<>
			<h1>Edit Tasks | AtsuoCoder Admin</h1>
			<p>Editing {id}</p>
			<br />
			<div className={styles.body1}>
				<form action="/admin/tasks/post/edit" method="post">
					<input type="hidden" name="id" defaultValue={id} />
					<label htmlFor="name">Name</label>
					<br />
					<input name="name" id="name" type="text" autoComplete="on" placeholder="A. console.log" required defaultValue={task.name} />
					<br />
					<label htmlFor="id">ID</label>
					<br />
					<input name="id" id="id" type="text" autoComplete="on" placeholder="aac001_a" required disabled defaultValue={id} />
					<br />
					<label htmlFor="editors">Editor</label>
					<br />
					<input name="editors" id="editors" type="text" required placeholder="yama_can, abn48" defaultValue={task.editor.join(', ')} />
					<br />
					<label htmlFor="editors" className={`${styles.warning} ${styles.show}`} id="editor-warning">
						<ul>
							<li> Warning: we will not warn if this field includes invalid username.</li>
						</ul>
					</label>
					<br />
					<label htmlFor="testers">Tester</label>
					<br />
					<input name="testers" id="testers" type="text" required placeholder="yama_can, abn48" defaultValue={task.tester.join(', ')} />
					<br />
					<label htmlFor="editors" className={`${styles.warning} ${styles.show}`} id="editor-warning">
						<ul>
							<li> Warning: we will not warn if this field includes invalid username.</li>
						</ul>
					</label>
					<br />
					<label htmlFor="question">Question</label>
					<br />
					<textarea name="question" id="question" required defaultValue={task.question} />
					<br />
					<input type="submit" defaultValue="Edit" />
				</form>
			</div>
		</>
	);

}