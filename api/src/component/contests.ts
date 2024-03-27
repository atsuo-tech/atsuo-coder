import { Connection } from "mysql2/promise";

export interface Contest {

	id: string;
	name: string;
	problems: string[];

	public: boolean;

	editors: string[];
	testers: string[];

	rated: string;
	unrated: string;

	start: number;
	period: number;

	description: string;

}

type Contests = Contest[];

export async function getContests(sql: Connection, userId?: string) {

	return new Promise<Contests>(async (resolve) => {

		const data = await sql.query("SELECT * from contests where public = 1 OR LOCATE(?, editors) > 0 OR LOCATE(?, testers) > 0 ORDER BY start ASC;", [`"${userId}"`, `"${userId}"`]);

		resolve(
			(data[0] as any[]).map((data: any) => {

				return { ...data, problems: JSON.parse(data.problems), editors: JSON.parse(data.editors), testers: JSON.parse(data.testers), start: new Date(data.start).getTime(), rated_users: JSON.parse(data.rated_users), unrated_users: JSON.parse(data.unrated_users) };

			})
		);

	})

}

export async function getContest(sql: Connection, id: string, userId?: string) {

	return new Promise<Contests>(async (resolve) => {

		const data = await sql.query(`SELECT * from contests where id = ? AND ( public = 1 ${!userId ? "" : " OR LOCATE(?, editors) > 0 OR LOCATE(?, testers) > 0"} ) ORDER BY start ASC;`, [id, userId, userId]);

		resolve(
			(data[0] as any[]).map((data: any) => {

				return { ...data, problems: JSON.parse(data.problems), editors: JSON.parse(data.editors), testers: JSON.parse(data.testers), start: new Date(data.start).getTime(), rated_users: JSON.parse(data.rated_users), unrated_users: JSON.parse(data.unrated_users) };

			})
		);

	})

}
