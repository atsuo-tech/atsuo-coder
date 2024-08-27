import Form from "@/components/form";
import getProblem from "@/lib/problem";
import getUser from "@/lib/user";
import { notFound, redirect } from "next/navigation";
import fs from "fs";
import { randomUUID } from "crypto";

export default async function Add({
	params: {
		contest: contest_id,
		task: id
	}
}: {
	params: {
		contest: string,
		task: string
	}
}) {

	async function action(formData: FormData) {

		"use server";

		const uuid = randomUUID();

		const user = await getUser();

		if (!user) {

			notFound();

		}

		fs.mkdirSync(`./static/editorials/${id}/${uuid}`, { recursive: true });

		fs.writeFileSync(`./static/editorials/${id}/${uuid}/data.json`, JSON.stringify({
			name: formData.get("name"),
			author: user!!.getID()
		}));

		fs.writeFileSync(`./static/editorials/${id}/${uuid}/text.md`, formData.get("description") as string);

		redirect(`/contests/${contest_id}/tasks/${id}/editorial/${uuid}`);

	}

	const task = await getProblem(id);

	if (!task) {

		notFound();

	}

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const isEditor = (await task.editors!!.get()).includes(user.getID()!!);
	const isTester = (await task.testers!!.get()).includes(user.getID()!!);

	if (await user.rating!!.get() < 2000 && !isEditor && !isTester) {

		notFound();

	}

	return (
		<>

			<h1>解説の追加</h1>

			<Form action={action}>

				<input type="text" name="name" placeholder="Name" required />
				<textarea name="description" placeholder="Description" required></textarea>

				<input type="submit" value="Submit" />

			</Form>

		</>
	);

}