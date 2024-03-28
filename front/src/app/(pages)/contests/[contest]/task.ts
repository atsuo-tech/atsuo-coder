import { Connection, RowDataPacket } from "mysql2/promise";
import redis from "@/app/redis";
import { sql } from "@/app/sql";
import { hasAdminPremission, hasProblemAdminPermission } from "../../admin/permission";
import getProblem, { Problem } from "@/lib/problem";

export async function getTasks(sql: Connection, userId?: string) {

	return new Promise<any[]>(async (resolve) => {

		const data = await sql.query("SELECT * from tasks where LOCATE(?, editors) > 0 OR LOCATE(?, testers) > 0 ORDER BY start ASC;", [`"${userId}"`, `"${userId}"`]);

		resolve(
			(data[0] as any[]).map((data: any) => {

				return { ...data, editors: JSON.parse(data.editors), testers: JSON.parse(data.testers) };

			})
		);

	})

}

export async function getTask(sql: Connection, id: string) {

	return new Promise<any>(async (resolve) => {

		/*const cache = await redis.get(`task:${id}`);
		if (cache != null) {
			const data = JSON.parse(cache);
			resolve(data);
			return;
		}*/

		const data = await sql.query(`SELECT * from tasks where id = ?;`, [id]);

		const res = (
			(data[0] as any[]).map((data: any) => {

				return { ...data, editors: JSON.parse(data.editors), testers: JSON.parse(data.testers) };

			})
		)[0];

		/*if (res) {
			await redis.set(`task:${id}`, JSON.stringify(res));
			await redis.expire(`task:${id}`, 60 * 60);
		}*/

		resolve(res);

	})

}

export async function getEditableTasks(user: string): Promise<Problem[]> {

	"use server";

	const [data] = await sql.query<RowDataPacket[]>(await hasAdminPremission() || await hasProblemAdminPermission() ? "SELECT * FROM tasks;" : "SELECT * FROM tasks where LOCATE(?, editors) > 0;", [user]);

	const problems = [];

	for (const value of data) {

		problems.push(await getProblem(value.id) as Problem);

	}

	return problems;

}
