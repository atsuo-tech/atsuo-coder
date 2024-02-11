import { Connection } from "mysql2/promise";
import redis from "@/app/redis";

export async function getTasks(sql: Connection, userId?: string) {

	return new Promise<any[]>(async (resolve) => {

		const data = await sql.query("SELECT * from tasks where LOCATE(?, editor) > 0 OR LOCATE(?, tester) > 0 ORDER BY start ASC;", [`"${userId}"`, `"${userId}"`]);

		resolve(
			(data[0] as any[]).map((data: any) => {

				return { ...data, editor: JSON.parse(data.editor), tester: JSON.parse(data.tester) };

			})
		);

	})

}

export async function getTask(sql: Connection, id: string) {

	return new Promise<any[]>(async (resolve) => {

		const cache = await redis.get(`task:${id}`);
		if (cache != null) {
			const data = JSON.parse(cache);
			resolve(data);
			return;
		}

		const data = await sql.query(`SELECT * from tasks where id = ?;`, [id]);

		const res = (
			(data[0] as any[]).map((data: any) => {

				return { ...data, editor: JSON.parse(data.editor), tester: JSON.parse(data.tester) };

			})
		);

		if (res.length != 0) {
			await redis.set(`task:${id}`, JSON.stringify(res));
			await redis.expire(`task:${id}`, 60 * 60);
		}
		resolve(res);

	})

}
