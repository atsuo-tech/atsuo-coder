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

		fs.rmdirSync(`./static/editorials/${task_id}/${id}`, { recursive: true });

		redirect(`/contests/${contest_id}/tasks/${task_id}/editorial/${id}`);

	}

	return (
		<>

			<h1>解説の削除</h1>

			<Form action={action}>

				<h2>情報</h2>

				<p>名前: {data.name}</p>
				<p>著者: {data.author}</p>

				<label htmlFor="confirm">注意：以上の解説は永久に削除され、復元することはできません。本当に削除しますか？</label>
				<input type="checkbox" name="confirm" required />

				<input type="submit" value="Edit" />

			</Form>

		</>
	);

}