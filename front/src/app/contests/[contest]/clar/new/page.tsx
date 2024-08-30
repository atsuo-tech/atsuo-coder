import { sql } from "@/app/sql";
import Form from "@/components/form";
import getContest from "@/lib/contest";
import getProblem from "@/lib/problem";
import getUser from "@/lib/user";
import { notFound, redirect } from "next/navigation";

export default async function Page({ params: { contest: contest_id } }: { params: { contest: string } }) {

	async function submit(formData: FormData) {

		"use server";

		const task = await getProblem(formData.get("task") as string);

		if (!task) {

			notFound();

		}

		await sql.query("INSERT INTO clar (id, contest, task, user, question, public) VALUES (uuid(), ?, ?, ?, ?, ?)", [contest_id, formData.get("task"), await getUser().then((user) => user?.getID()), formData.get("question"), formData.get("visibility") == "public"]);

		redirect(`/contests/${contest_id}/clar`);

	}

	const contest = await getContest(contest_id);

	if (!contest) {

		notFound();

	}

	return (
		<>

			<h1>質問</h1>

			<Form action={submit}>

				<select name="task" defaultValue={(await contest.tasks!!.get())[0]}>

					{
						await Promise.all(
							(await contest.tasks!!.get()).map(async (task_id, i) => {

								const task = await getProblem(task_id)!!;

								return <option value={task_id} key={i}>{await task!!.name!!.get()}</option>

							})
						)
					}

				</select>

				<textarea name="question" placeholder="質問内容" required></textarea>

				<select name="visibility" defaultValue="public">

					<option value="public">質問の公開が可能</option>
					<option value="private">質問の公開が不可能</option>

				</select>

				<input type="submit" value="質問する" />

			</Form>

		</>
	)

}
