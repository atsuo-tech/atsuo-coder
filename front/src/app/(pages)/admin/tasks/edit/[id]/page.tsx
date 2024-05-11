import styles from "../../form.module.css";
import { getTask } from "@/app/(pages)/contests/[contest]/task";
import { sql } from "@/app/sql";
import { notFound } from "next/navigation";
import { hasProblemAdminPermission } from "../../../permission";
import getUser from "@/lib/user";
import Form from "@/components/form";
import Warning from "@/components/form/warnings";

export default async function PostEditTask({ params: { id }, searchParams: { done } }: { params: { id: string }, searchParams: { done?: string } }) {

	const user = await getUser();

	const task = await getTask(sql, id);

	if (!user || !task) {

		notFound();

	}

	if (!await hasProblemAdminPermission() && !task.editors.includes(user.getID()!!)) {

		notFound();

	}

	return (
		<>
			<h1>Edit Tasks | AtsuoCoder Admin</h1>
			<p>Editing {id}</p>
			<Form action="/admin/tasks/post/edit" method="post">
				<input type="hidden" name="id" defaultValue={id} />
				<label htmlFor="name">Name</label>
				<br />
				<input name="name" id="name" type="text" autoComplete="on" placeholder="A. console.log" required defaultValue={task.name} />
				<br />
				<label htmlFor="id">ID</label>
				<br />
				<input name="id" id="id" type="text" autoComplete="on" placeholder="aac001_a" required disabled defaultValue={id} />
				<br />
				<label htmlFor="editors">Editors</label>
				<br />
				<input name="editors" id="editors" type="text" required placeholder="yama_can, abn48" defaultValue={task.editors.join(', ')} />
				<br />
				<Warning>
					Warning: we will not warn if this field includes invalid username.
				</Warning>
				<label htmlFor="testers">Testers</label>
				<br />
				<input name="testers" id="testers" type="text" required placeholder="yama_can, abn48" defaultValue={task.testers.join(', ')} />
				<br />
				<Warning>
					Warning: we will not warn if this field includes invalid username.
				</Warning>
				<label htmlFor="question">Question</label>
				<br />
				<textarea name="question" id="question" required defaultValue={task.question} />
				<br />
				<input type="submit" defaultValue="Edit" />
			</Form>
		</>
	);

}