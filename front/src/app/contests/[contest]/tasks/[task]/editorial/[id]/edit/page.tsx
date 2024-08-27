import Form from "@/components/form";
import getProblem from "@/lib/problem";
import getUser from "@/lib/user";
import { notFound, redirect } from "next/navigation";
import fs from "fs";
import { randomUUID } from "crypto";

export default async function Add({
	params: {
		contest: contest_id,
		task: task_id,
		id
	}
}: {
	params: {
		contest: string,
		task: string,
		id: string
	}
}) {

	const task = await getProblem(task_id);

	if (!task) {

		notFound();

	}

	if (!fs.statSync(`./static/editorials/${task_id}/${id}`, { throwIfNoEntry: true })?.isDirectory()) {

		notFound();

	}

	const data = JSON.parse(fs.readFileSync(`./static/editorials/${task_id}/${id}/data.json`, 'utf-8'));

	const user = await getUser();

	if (user?.getID() != data.author) {

		notFound();

	}

	async function action(formData: FormData) {

		"use server";

		const user = await getUser();

		if (!user) {

			notFound();

		}

		fs.writeFileSync(`./static/editorials/${task_id}/${id}/data.json`, JSON.stringify({
			name: formData.get("name"),
			author: user!!.getID()
		}));

		fs.writeFileSync(`./static/editorials/${task_id}/${id}/text.md`, formData.get("description") as string);

		redirect(`/contests/${contest_id}/tasks/${task_id}/editorial/${id}`);

	}

	return (
		<>

			<h1>解説を編集</h1>

			<Form action={action}>

				<input type="text" name="name" placeholder="Name" defaultValue={data.name} required />
				<textarea name="description" placeholder="Description" defaultValue={fs.readFileSync(`./static/editorials/${task_id}/${id}/text.md`, 'utf-8')} required></textarea>

				<input type="submit" value="Edit" />

			</Form>

		</>

	);

}