import { sql } from "@/app/sql";
import getContest from "@/lib/contest";
import getUser from "@/lib/user";
import { RowDataPacket } from "mysql2";
import { notFound, redirect } from "next/navigation";

export default async function Rejudge({ params }: { params: { contest: string, id: string } }) {

	const user = await getUser();

	const contest = await getContest(params.contest);

	if (!(await contest!!.editors!!.get()).includes(user!!.getID()!!)) {

		notFound();

	}

	const result = await sql.query<RowDataPacket[]>(`SELECT contest, sourceCode, judge, task, user from submissions WHERE id = ?`, [params.id]);

	if (result[0].length == 0 || result[0][0].contest != params.contest) {

		notFound();

	}

	await sql.query(`UPDATE submissions SET judge = 'WJ' WHERE id = ?`, [params.id]);

	redirect(`/contests/${params.contest}/submissions/${params.id}`);

}