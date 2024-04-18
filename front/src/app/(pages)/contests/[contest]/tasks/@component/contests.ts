import SqlString from "sqlstring";
import { Connection, FieldPacket } from "mysql2/promise";
import redis from "@/app/redis";

export interface Contest {

	id: string;
	name: string;
	problems: string[];

	public: boolean;

	editors: string[];
	testers: string[];

	start: number;
	period: number;

}

export type Contests = Contest[];

export async function getContests(sql: Connection, userId?: string) {

	return new Promise<Contests>(async (resolve) => {

		const data = await sql.query("SELECT * from contests where public = 1 OR LOCATE(?, editors) > 0 OR LOCATE(?, testers) > 0 ORDER BY start ASC;", [`"${userId}"`, `"${userId}"`]);

		resolve(
			(data[0] as any[]).map((data: any) => {

				return { ...data, problems: JSON.parse(data.problems), editors: JSON.parse(data.editors), testers: JSON.parse(data.testers), start: new Date(data.start).getTime() };

			})
		);

	})

}

export async function getContest(sql: Connection, id: string, showPublic = false) {

	return new Promise<Contests>(async (resolve) => {

		const data = await sql.query("SELECT * from contests where id = ? AND public = ? ORDER BY start ASC;", [id, showPublic]);

		resolve(
			(data[0] as any[]).map((data: any) => {

				return { ...data, problems: JSON.parse(data.problems), editors: JSON.parse(data.editors), testers: JSON.parse(data.testers), start: new Date(data.start).getTime() };

			})
		);

	})

}

export async function getTasks(sql: Connection, ids: string[]) {

	return new Promise<{ id: string, question: string, judge_type: number, editors: string[], testers: string[], name: string, score: number }[]>(async (resolve) => {

		const id = Array.from(ids);

		let res: { id: string, question: string, judge_type: number, editors: string[], testers: string[], name: string, score: number }[] = [];

		let resolvers: string[] = [];

		for (let i = 0; i < id.length; i++) {

			/*const cache = await redis.get(`task:${id[i]}`);

			if (cache) {
				id[i] = "";
				res[i] = JSON.parse(cache);
			} else {*/
				resolvers.push(id[i]);
			/*}*/

		}


		if (resolvers.length == 0) {
			resolve(res);
			return;
		}

		const [data] = await sql.query("SELECT * from tasks where id IN (?);", [resolvers]) as [any[], FieldPacket[]];

		for (let i = 0; i < id.length; i++) {

			if (id[i] == "") continue;

			const src = data.find((task: any) => task.id == id[i]);

			if (!src) continue;

			res[i] = { ...src, editors: JSON.parse(src.editors), testers: JSON.parse(src.testers) };

			//await redis.set(`task:${id[i]}`, JSON.stringify(res[i]));
			//await redis.expire(`task:${id[i]}`, 60 * 60);

		}

		resolve(res);

	})

}
