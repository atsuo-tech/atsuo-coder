import { Connection, Field, FieldPacket, RowDataPacket } from "mysql2/promise";
import crypto from "crypto";

export interface User {

	id: string;

	name: [string] | [string, string] | [string, string, string];
	grade: number;

	rating: number;

	// SHA256 hashed password
	password: string;

	admin: boolean;

}

export type Users = User[];

export async function getUsers(sql: Connection) {

	return new Promise<Users>(async (resolve) => {

		const data = await sql.query("SELECT * from users;");

		resolve(
			(data[0] as any[]).map((data: any) => {

				return { ...data, name: JSON.parse(data.name) };

			})
		);

	})

}

export async function getUser(sql: Connection, id: string) {

	return new Promise<User | null>(async (resolve) => {

		const data = await sql.query("SELECT * from users where id = ?;", [id]);

		const res = (data[0] as any[]).map((data: any) => {

			return { ...data, name: JSON.parse(data.name) };

		});

		resolve(res.length == 0 ? null : res[0]);

	})

}

export async function getUserUsingPassword(sql: Connection, id: string, password: string) {

	return new Promise<User | null>(async (resolve) => {

		const hash = crypto.createHash("sha256").update(password).digest("hex");

		const data = await sql.query("SELECT * from users where id = ? AND password = ?;", [id, hash]);

		const res = (data[0] as any[]).map((data: any) => {

			return { ...data, name: JSON.parse(data.name) };

		});

		resolve(res.length == 0 ? null : res[0]);

	})

}

export async function getUserByToken(sql: Connection, token?: string, ct?: string) {

	return new Promise<User | null>(async (resolve) => {

		if (token == undefined || ct == undefined) {
			resolve(null);
			return;
		}

		const [tokens] = await sql.query("SELECT * from tokens where id = ? AND ct = ?;", [token, ct]) as [RowDataPacket[], FieldPacket[]];

		if (tokens.length == 0) {
			resolve(null);
			return;
		}

		const user = await getUser(sql, tokens[0].user);

		if (!user) {
			resolve(null);
			return;
		}

		resolve(user);
	});
}

export async function login(sql: Connection, userId: string) {

	return new Promise<{ token: string, ct: string }>(async (resolve) => {

		let token = crypto.randomUUID(), ct = crypto.randomUUID();

		await sql.query("DELETE FROM tokens where created_at < now() - interval 1 month;");
		await sql.query("INSERT INTO tokens (id, ct, user, created_at) VALUES (?, ?, ?, now());", [token, ct, userId]);

		resolve({ token, ct });

	});

}
