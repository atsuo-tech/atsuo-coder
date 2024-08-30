import { sql } from "@/app/sql";
import { RowDataPacket } from "mysql2";
import Value from "@/lib/value";
import { makeDateSQLValue, makeRawSQLValue } from "../value/mysql";

const cache: { [id: string]: Clar } = {};

export class Clar {

	public id: string | null = null;

	public contest: Value<string, string> | null = null;
	public task: Value<string, string> | null = null;
	public user: Value<string, string> | null = null;
	public created_at: Value<Date, string> | null = null;
	public question: Value<string, string> | null = null;
	public answer: Value<string | null, string> | null = null;
	public written_by: Value<string | null, string> | null = null;
	public public: Value<boolean, string> | null = null;

	private loader: Promise<void> | null = null;

	private valid: boolean = false;

	constructor(id?: string) {

		if (id) {

			this.loader = this.load(id);

		}

	}

	private async load(id: string) {

		this.id = id;

		this.contest = await makeRawSQLValue(id, "clar", "contest");
		this.task = await makeRawSQLValue(id, "clar", "task");
		this.user = await makeRawSQLValue(id, "clar", "user");
		this.created_at = await makeDateSQLValue(id, "clar", "created_at");
		this.question = await makeRawSQLValue(id, "clar", "question");
		this.answer = await makeRawSQLValue(id, "clar", "answer");
		this.written_by = await makeRawSQLValue(id, "clar", "written_by");
		this.public = await makeRawSQLValue(id, "clar", "public");

		this.valid = true;

	};

	public async awaiter() {

		await this.loader;

	}

	public isValid() {

		return this.valid;

	}

}

export default async function getClar(id: string) {

	if (id in cache) {

		return cache[id];

	}

	const clar = new Clar(id);
	await clar.awaiter();

	if (clar.isValid()) {

		cache[id] = clar;

		return clar;

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

export async function deleteCache(id: string) {

	delete cache[id];

}

export async function getContestClars(contest: string) {

	const [data] = await sql.query<RowDataPacket[]>("SELECT id FROM clar WHERE contest = ?", [contest]);

	return Promise.all(data.map((row) => getClar(row.id) as Promise<Clar>));

}
