import { sql } from "@/app/sql";
import { RowDataPacket } from "mysql2";
import Value from "@/lib/value";
import { makeRawSQLValue, makeObjectSQLValue, makeDateSQLValue } from "../value/mysql";

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

	public tasks: Value<string[], string> | null = null;

	private loader: Promise<void> | null = null;

	private valid: boolean = false;

	constructor(id?: string) {

		if (id) {

			this.loader = this.load(id);

		}

	}

	private async load(id: string) {

		this.id = id;

		this.owner = await makeRawSQLValue(id, "contests", "owner");
		this.editors = await makeObjectSQLValue(id, "contests", "editors");
		this.testers = await makeObjectSQLValue(id, "contests", "testers");
		this.problems = await makeObjectSQLValue(id, "contests", "problems");
		this.name = await makeRawSQLValue(id, "contests", "name");
		this.start = await makeDateSQLValue(id, "contests", "start");
		this.period = await makeRawSQLValue(id, "contests", "period");
		this.penalty = await makeRawSQLValue(id, "contests", "penalty");
		this.public = await makeRawSQLValue(id, "contests", "public");
		this.rated = await makeRawSQLValue(id, "contests", "rated");
		this.rated_users = await makeObjectSQLValue(id, "contests", "rated_users");
		this.unrated_users = await makeObjectSQLValue(id, "contests", "unrated_users");
		this.description = await makeRawSQLValue(id, "contests", "description");
		this.tasks = await makeObjectSQLValue(id, "contests", "problems");

		this.valid = true;

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

export async function deleteCache(id: string) {

	delete cache[id];

}

export async function getAllContests() {

	return sql.query("SELECT id FROM contests;").then((data) => {

		return (data[0] as RowDataPacket[]).map((row) => row.id);

	});

}

export async function getManagaedContests(id: string, includePublic: boolean = true) {

	return sql.query(`SELECT id FROM contests WHERE ${includePublic ? "public = 1 OR" : ""} LOCATE(?, editors) > 0 OR LOCATE(?, testers) > 0;`, [`"${id}"`, `"${id}"`]).then((data) => {

		return Promise.all((data[0] as RowDataPacket[]).map((row) => getContest(row.id)));

	});

}
