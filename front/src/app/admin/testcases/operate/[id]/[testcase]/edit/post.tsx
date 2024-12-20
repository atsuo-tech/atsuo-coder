import getProblems from "@/lib/problem";
import fs from "fs";
import { notFound } from "next/navigation";
import getUser from "@/lib/user";
import Form from "@/components/form";
import { hasProblemAdminPermission } from "@/lib/accounts/permission";

export default async function PostEditTestcase(task_id: string, id: string) {

	const task = await getProblems(task_id);

	if (!task) {

		notFound();

	}

	if (!(fs.statSync(`./static/testcases/${task_id}/${id}`, { throwIfNoEntry: false })?.isDirectory())) {

		notFound();

	}

	const user = await getUser();

	if (!user) {

		notFound();

	}

	if (!await hasProblemAdminPermission() && !(await task.editors!!.get()).includes(user.getID()!!)) {

		notFound();

	}


	return (
		<>
			<h1>Edit Testcase | AtsuoCoder Admin</h1>
			<br />
			<Form action="/admin/testcases/post/edit" method="post">
				<input type="hidden" name="type" defaultValue="edit" />
				<label htmlFor="task_id">Task ID</label>
				<br />
				<input name="task_id" type="hidden" defaultValue={task_id} />
				<input id="task_id" type="text" autoComplete="on" placeholder="aac001_a" required defaultValue={task_id} disabled />
				<br />
				<label htmlFor="id">ID</label>
				<br />
				<input name="id" type="hidden" defaultValue={id} />
				<input id="id" type="text" autoComplete="on" placeholder="test_a" required defaultValue={id} disabled />
				<br />
				<label htmlFor="score">Score</label>
				<br />
				<input id="score" name="score" type="number" placeholder="Score" required defaultValue={(await task.score!!.get()).toString()} />
				<br />
				<label htmlFor="input">Reupload input files</label>
				<br />
				<input name="input" id="input" type="file" multiple accept=".txt" />
				<br />
				<label htmlFor="output">Reupload output files</label>
				<br />
				<input name="output" id="output" type="file" multiple accept=".txt" />
				<input type="submit" defaultValue="Edit" />
			</Form>
		</>
	);

}