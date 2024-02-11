import { sql } from "@/app/sql";
import Value from "@/lib/value";
import Cache from "@/lib/cache";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import crypto from "crypto";
import { cookies } from "next/headers";

export namespace Permissions {

	export enum BasePermissions {

		Admin = 1 << 0,
		ProblemAdmin = 1 << 1,
		ProblemMaker = 1 << 2,
		ContestAdmin = 1 << 3,
		ContestMaker = 1 << 4,
		UserAdmin = 1 << 5,
		UserApprover = 1 << 6,
		TrustedUser = 1 << 7,

	};

	export enum ProblemPermissions {

		ProblemOwner = 1 << 0,
		ProblemEditor = 1 << 1,
		ProblemTester = 1 << 2

	};

	export enum ContestPermissions {

		ContestOwner = 1 << 0,
		ContestEditor = 1 << 1,
		ContestTester = 1 << 2

	};

	export function hasPermission<T extends BasePermissions | ProblemPermissions | ContestPermissions>(userPermission: T, permission: T) {

		return (userPermission & permission) != 0;

	}

};

const cache: { [key: string]: User } = {};

export class User {

	private id: string | null = null;

	public rating: Value<number, string> | null = null;
	public name: Value<string[], string> | null = null;
	public permission: Value<number, string> | null = null;
	public password: Value<string, string> | null = null;
	public grade: Value<number, string> | null = null;

	private loader: Promise<void> | null = null;

	private valid = false;

	constructor(id?: string) {

		"use server";

		if (typeof id == "string") {

			this.loader = this.load(id);

		}

	}

	public async load(id?: string) {

		if (id) {

			return sql.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ?", [id]).then(([result]) => {

				if (result.length > 0) {

					const row = result[0];

					this.id = row.id;

					this.permission = new Value<number, string>(this.id!!, Number(row.admin), 1000 * 60 * 60, async (id) => {

						const [result] = await sql.query<RowDataPacket[]>("SELECT admin FROM users WHERE id = ?", [id])

						if (result.length > 0) {

							const row = result[0];

							return Number(row.admin);

						} else {

							return 0;

						}

					}, async (value, id) => {

						await sql.query<ResultSetHeader>("UPDATE users SET admin = ? WHERE id = ?", [value, id]);

					});


					this.name = new Value<string[], string>(id, JSON.parse(row.name), 1000 * 60 * 60, async (id) => {

						const [result] = await sql.query<RowDataPacket[]>("SELECT name FROM users WHERE id = ?", [id]);

						const row = result[0];

						return JSON.parse(row.name);

					}, async (value, id) => {

						await sql.query<ResultSetHeader>("UPDATE users SET name = ? WHERE id = ?", [JSON.stringify(value), id]);

					});

					this.rating = new Value<number, string>(id, Number(row.rating), 1000 * 60 * 60, async (id) => {

						const [result] = await sql.query<RowDataPacket[]>("SELECT rating FROM users WHERE id = ?", [id]);

						const row = result[0];

						return Number(row.rating);

					}, async (value, id) => {

						await sql.query<ResultSetHeader>("UPDATE users SET rating = ? WHERE id = ?", [value, id]);

					});

					this.password = new Value<string, string>(id, row.password, 0, async (id) => {

						const [data] = await sql.query<RowDataPacket[]>("SELECT password FROM users WHERE id = ?;", [id]);

						return data[0].password;

					}, async (value, id) => {

						await sql.query<ResultSetHeader>("UPDATE users SET password = ? WHERE id = ?", [crypto.createHash("sha256").update(value).digest("hex"), id]);

					});

					this.grade = new Value<number, string>(id, Number(row.grade), 1000 * 60 * 60, async (id) => {

						const [result] = await sql.query<RowDataPacket[]>("SELECT grade FROM users WHERE id = ?", [id]);

						const row = result[0];

						return Number(row.grade);

					}, async (value, id) => {

						await sql.query("UPDATE users SET grade = ? WHERE id = ?", [value, id]);

					});

					this.valid = true;

				}


			});

		}

	}

	public async awaiter() {

		return await this.loader;

	}

	public getID() {

		return this.id;

	}

	public isValid() {

		return this.valid;

	}

	public contests: Cache<string[]> = new Cache<string[]>(async () => {

		const data = await sql.query("SELECT * from contests where public = 1 OR LOCATE(?, editor) > 0 OR LOCATE(?, tester) > 0 ORDER BY start ASC;", [`"${this.id}"`, `"${this.id}"`]);

		return (data[0] as any[]).map((element) => element.id);

	}, 1000 * 60 * 30);

}

export default async function getUser(id?: string) {

	"use server";

	if (!id) {

		const cookie = cookies();

		const ct = cookie.get("ct");
		const cc = cookie.get("cc");

		const [data] = await sql.query<RowDataPacket[]>("SELECT * from tokens where id = ? AND ct = ? AND DATEDIFF(now(), created_at) < 30;", [cc?.value, ct?.value]);

		if (data.length == 0) {

			return null;
			
		} else {

			id = data[0].user as string;

		}

	}

	if (id in cache) {

		return cache[id];

	}

	const user = new User(id);
	await user.awaiter();

	if (user.isValid()) {

		cache[id] = user;

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