import Form from "@/components/form";
import getClar from "@/lib/clar";
import getContest from "@/lib/contest";
import getUser from "@/lib/user";
import { notFound, redirect } from "next/navigation";

export default async function Answer({ params: { contest: contest_id, id } }: { params: { contest: string, id: string } }) {

	const clar = await getClar(id);

	const contest = await getContest(contest_id);

	const user = await getUser().then((user) => user?.getID());

	if (!clar || !contest || !user || await clar.contest!!.get() != contest_id || ((await contest?.editors!!.get()).indexOf(user) == -1 && (await contest?.testers!!.get()).indexOf(user) == -1)) {

		notFound();

	}

	async function submit(data: FormData) {

		"use server";

		const clar = await getClar(id);
		const user = await getUser().then((user) => user?.getID());

		clar!!.answer!!.set(data.get("answer") as string);
		clar!!.written_by!!.set(user!!);
		clar!!.public!!.set(data.get("public") == "true");

		redirect(`/contests/${contest_id}/clar`);

	}

	return (

		<>

			<h1>回答を{!(await clar.answer?.get()) ? "追加" : "編集"}</h1>

			<Form action={submit}>

				<h2>質問内容</h2>
				<textarea readOnly>{await clar.question?.get()}</textarea>

				<textarea name="answer" defaultValue={await clar.answer!!.get() || ""} placeholder="回答"></textarea>

				<select name="public" defaultValue={await clar.public!!.get() ? "true" : "false"}>

					<option value="true" disabled={!(await clar.public!!.get())}>公開</option>
					<option value="false">非公開</option>

				</select>

				<input type="submit" value="送信" />

			</Form>

		</>

	)

}
