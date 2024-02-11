import { Connection, Field, FieldPacket, RowDataPacket } from "mysql2/promise";
import crypto from "crypto";
import redis from "@/app/redis";

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

		const cache = await redis.get(`user:${id}`);

		if (cache != null) {
			const data = JSON.parse(cache);
			resolve(data);
			return;
		}

		const data = await sql.query("SELECT * from users where id = ?;", [id]);

		const res = (data[0] as any[]).map((data: any) => {

			return { ...data, name: JSON.parse(data.name) };

		});

		await redis.set(`user:${id}`, JSON.stringify(res[0]));
		await redis.expire(`user:${id}`, 60 * 60 * 24 * 7);

		resolve(res.length == 0 ? null : res[0]);

	})

}

export async function getUserUsingPassword(sql: Connection, id: string, password: string) {

	return new Promise<User | null>(async (resolve) => {

		const hash = crypto.createHash("sha256").update(password).digest("hex");

		const cache = await redis.get(`user:${id}`);

		if (cache != null) {
			const data = JSON.parse(cache);
			if (data.password == hash) {
				resolve(data);
			} else {
				resolve(null);
			}
			return;
		}

		const data = await sql.query("SELECT * from users where id = ? AND password = ?;", [id, hash]);

		const res = (data[0] as any[]).map((data: any) => {

			return { ...data, name: JSON.parse(data.name) };

		});

		resolve(res.length == 0 ? null : res[0]);

	})

}

export async function getUserByToken(sql: Connection, token?: string, ct?: string) {

	return new Promise<User | null>(async (resolve) => {

		const cache = await redis.get(`user:token:${token}:${ct}`);

		if (cache != null) {
			resolve(getUser(sql, cache));
			return;
		}

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

		await redis.set(`user:token:${token}:${ct}`, user.id);
		await redis.expire(`user:token:${token}:${ct}`, 60 * 60);
		await redis.set(`user:${user.id}`, JSON.stringify(user));
		await redis.expire(`user:${user.id}`, 60 * 60);
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
