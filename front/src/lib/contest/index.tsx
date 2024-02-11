import { sql } from "@/app/sql";
import { RowDataPacket } from "mysql2";
import Value from "@/lib/value";

const cache: { [id: string]: Contest } = {};

export class Contest {

	public id: string | null = null;

	public owner: Value<string, string> | null = null;
	public editors: Value<string[], string> | null = null;
	public testers: Value<string[], string> | null = null;

	public problems: Value<string[], string> | null = null;

	public name: Value<string, string> | null = null;
	public start: Value<Date, string> | null = null;
	public period: Value<number, string> | null = null;
	public penalty: Value<number, string> | null = null;

	public public: Value<boolean, string> | null = null;
	public rated: Value<string, string> | null = null;

	public rated_users: Value<string[], string> | null = null;
	public unrated_users: Value<string[], string> | null = null;

	public description: Value<string, string> | null = null;

	private loader: Promise<void> | null = null;

	private valid: boolean = false;

	constructor(id?: string) {

		if (id) {

			this.loader = this.load(id);

		}

	}

	private async load(id: string) {

		return sql.query("SELECT * FROM contests WHERE id = ?", [id]).then((data) => {

			if ((data[0] as any[]).length != 0) {

				const row = (data[0] as any[])[0];

				this.id = id;

				this.owner = new Value(id, row.owner, 1000 * 60 * 60, async (id) => {

					const [data] = await sql.query<RowDataPacket[]>("SELECT owner FROM contests WHERE id = ?", [id]);

					return data[0].owner;

				}, async (value, id) => {

					await sql.query("UPDATE contests SET owner = ? WHERE id = ?;", [value, id]);

				});

				this.editors = new Value(id, JSON.parse(row.editors || "[]"), 1000 * 60 * 60, async (id) => {

					const [data] = await sql.query<RowDataPacket[]>("SELECT editors FROM contests WHERE id = ?", [id]);

					return JSON.parse(data[0].editors);

				}, async (value, id) => {

					await sql.query("UPDATE contests SET editors = ? WHERE id = ?;", [JSON.stringify(value), id]);

				});

				this.testers = new Value(id, JSON.parse(row.testers || "[]"), 1000 * 60 * 60, async (id) => {

					const [data] = await sql.query<RowDataPacket[]>("SELECT testers FROM contests WHERE id = ?", [id]);

					return JSON.parse(data[0].testers);

				}, async (value, id) => {

					await sql.query("UPDATE contests SET testers = ? WHERE id = ?;", [value, id]);

				});

				this.problems = new Value(id, JSON.parse(row.problems), 1000 * 60 * 60, async (id) => {

					const [data] = await sql.query<RowDataPacket[]>("SELECT problems FROM contests WHERE id = ?", [id]);

					return JSON.parse(data[0].problems);

				}, async (value, id) => {

					await sql.query("UPDATE contests SET problems = ? WHERE id = ?;", [value, id]);

				});

				this.name = new Value(id, row.name, 1000 * 60 * 60, async (id) => {

					const [data] = await sql.query<RowDataPacket[]>("SELECT name FROM contests WHERE id = ?", [id]);

					return data[0].name;

				}, async (value, id) => {

					await sql.query("UPDATE contests SET name = ? WHERE id = ?;", [value, id]);

				});

				this.start = new Value(id, new Date(row.start), 1000 * 60 * 60, async (id) => {

					const [data] = await sql.query<RowDataPacket[]>("SELECT start FROM contests WHERE id = ?", [id]);

					return new Date(data[0].start);

				}, async (value, id) => {

					await sql.query("UPDATE contests SET start = ? WHERE id = ?;", [value, id]);

				});

				this.period = new Value(id, row.period, 1000 * 60 * 60, async (id) => {

					const [data] = await sql.query<RowDataPacket[]>("SELECT period FROM contests WHERE id = ?", [id]);

					return data[0].period;

				}, async (value, id) => {

					await sql.query("UPDATE contests SET period = ? WHERE id = ?;", [value, id]);

				});

				this.penalty = new Value(id, row.penalty, 1000 * 60 * 60, async (id) => {

					const [data] = await sql.query<RowDataPacket[]>("SELECT penalty FROM contests WHERE id = ?", [id]);

					return data[0].penalty;

				}, async (value, id) => {
					
					await sql.query("UPDATE contests SET penalty = ? WHERE id = ?;", [value, id]);

				});

				this.public = new Value(id, row.isPublic, 1000 * 60 * 60, async (id) => {

					const [data] = await sql.query<RowDataPacket[]>("SELECT public FROM contests WHERE id = ?", [id]);

					return data[0].public;

				}, async (value, id) => {

					await sql.query("UPDATE contests SET public = ? WHERE id = ?;", [value, id]);

				});

				this.rated = new Value(id, row.rated, 1000 * 60 * 60, async (id) => {

					const [data] = await sql.query<RowDataPacket[]>("SELECT rated FROM contests WHERE id = ?", [id]);

					return data[0].rated;

				}, async (value, id) => {

					await sql.query("UPDATE contests SET rated = ? WHERE id = ?;", [value, id]);

				});

				this.rated_users = new Value(id, JSON.parse(row.rated_users), 0, async (id) => {

					const [data] = await sql.query<RowDataPacket[]>("SELECT rated_users FROM contests WHERE id = ?", [id]);

					return JSON.parse(data[0].rated_users);

				}, async (value, id) => {

					await sql.query("UPDATE contests SET rated_users = ? WHERE id = ?;", [JSON.stringify(value), id]);

				});

				this.unrated_users = new Value(id, JSON.parse(row.unrated_users), 0, async (id) => {

					const [data] = await sql.query<RowDataPacket[]>("SELECT unrated_users FROM contests WHERE id = ?", [id]);

					return JSON.parse(data[0].unrated_users);

				}, async (value, id) => {

					await sql.query("UPDATE contests SET unrated_users = ? WHERE id = ?;", [JSON.stringify(value), id]);

				});

				this.description = new Value(id, row.description, 1000 * 60 * 60, async (id) => {
					
					const [data] = await sql.query<RowDataPacket[]>("SELECT description FROM contests WHERE id = ?", [id]);

					return data[0].description;

				}, async (value, id) => {
					
					await sql.query("UPDATE contests SET description = ? WHERE id = ?;", [value, id]);

				});

				this.valid = true;

			} else {

				this.valid = false;

			}

		});

	};

	public async awaiter() {

		await this.loader;

	}

	public isValid() {

		return this.valid;

	}

}

export default async function getContest(id: string) {

	if (id in cache) {

		return cache[id];

	}

	const contest = new Contest(id);
	await contest.awaiter();

	if (contest.isValid()) {

		cache[id] = contest;

		return contest;

	} else {

		return null;

	}

}

export function clearCache() {

	const keys = Object.keys(cache);

	for (const key of keys) {

		delete cache[key];

	}

	return keys.length;

}

export function cacheSize() {

	return Object.keys(cache).length;

}

export async function getPublicContests() {

	return sql.query("SELECT id FROM contests WHERE public = true;").then((data) => {

		return (data[0] as RowDataPacket[]).map((row) => row.id);

	});

}
