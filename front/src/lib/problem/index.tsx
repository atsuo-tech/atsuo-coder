import { sql } from "@/app/sql";
import Value from "../value";

let cache: { [id: string]: Problem } = {};

export class Problem {

	constructor(id?: string) {

		if (id) {

			this.loader = sql.query("SELECT * FROM tasks WHERE id = ?", [id]).then((data) => {

				const rows = data[0] as any[];

				if (rows.length === 0) return;

				const row = rows[0];

				this.name = new Value<string, string>(id, row.name, 1000 * 60 * 60 * 24, async (id) => {

					const [data] = await sql.query("SELECT name FROM tasks WHERE id = ?", [id]);

					const row = (data as any[])[0];

					return (row as { name: string }).name;

				}, async (value, id) => {

					await sql.query("UPDATE tasks SET name = ? WHERE id = ?", [value, id]);

				});


				this.score = new Value<bigint, string>(id, BigInt(row.score), 1000 * 60 * 60 * 24, async (id) => {

					const [data] = await sql.query("SELECT score FROM tasks WHERE id = ?", [id]);

					const row = (data as any[])[0];

					return BigInt((row as { score: string }).score);

				}, async (value, id) => {

					await sql.query("UPDATE tasks SET score = ? WHERE id = ?", [value.toString(), id]);

				});

				this.editors = new Value<string[], string>(id, JSON.parse(row.editors), 1000 * 60 * 60 * 24, async (id) => {

					const [data] = await sql.query("SELECT editors FROM tasks WHERE id = ?", [id]);

					const row = (data as any[])[0];

					return JSON.parse((row as { editors: string }).editors);

				}, async (value, id) => {

					await sql.query("UPDATE tasks SET editors = ? WHERE id = ?", [JSON.stringify(value), id]);

				});

				this.testers = new Value<string[], string>(id, JSON.parse(row.testers), 1000 * 60 * 60 * 24, async (id) => {

					const [data] = await sql.query("SELECT testers FROM tasks WHERE id = ?", [id]);

					const row = (data as any[])[0];

					return JSON.parse((row as { testers: string }).testers);

				}, async (value, id) => {

					await sql.query("UPDATE tasks SET testers = ? WHERE id = ?", [JSON.stringify(value), id]);

				});

				this.id = row.id;

				this.valid = true;

			});

		}


	}

	private valid: boolean = false;

	private loader: Promise<void> | null = null;

	private id: string | null = null;

	public name: Value<string, string> | null = null;
	public score: Value<bigint, string> | null = null;

	public editors: Value<string[], string> | null = null;
	public testers: Value<string[], string> | null = null;

	public async getID() {

		return this.id;

	}

	public async awaiter() {

		return await this.loader;

	}

	public isValid() {

		return this.valid;

	}

}

export default async function getProblem(id: string) {

	if (id in cache) {

		return cache[id];

	}

	const problem = new Problem(id);
	await problem.awaiter();

	if (problem.isValid()) {

		cache[id] = problem;

		return cache[id];

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
