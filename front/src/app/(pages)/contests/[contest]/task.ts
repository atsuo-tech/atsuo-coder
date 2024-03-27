import { Connection } from "mysql2/promise";
import redis from "@/app/redis";

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
