import { sql } from "@/app/sql";
import { Token, User } from "./types";
import { randomUUID } from "crypto";
import crypto from "crypto";

export namespace Detail {

	export async function getToken(cc: string, ct?: string): Promise<Token | null> {

		return new Promise<Token | null>((resolve, reject) => {

			sql.query(`SELECT * FROM tokens WHERE id = ? ${ct ? "AND ct = ?" : ""}`, [cc, ct]).then(([result]) => {

				if ((result as any[]).length === 0) return resolve(null);

				resolve({ ...(result as any[])[0], created_at: new Date((result as any[])[0].created_at) } as Token);

			});

		});

	}

	export async function makeToken(user: string): Promise<Token> {

		return new Promise<Token>((resolve, reject) => {

			const cc = randomUUID();
			const ct = randomUUID();
			const created_at = new Date();

			sql.query("INSERT INTO tokens (id, ct, user, created_at) VALUES (?, ?, ?, ?)", [cc, ct, user, created_at]).then(([result]) => {

				resolve({ cc, ct, user, created_at } as Token);

			});

		});

	}

	export async function getUser(id: string): Promise<User | null> {

		return new Promise<User | null>((resolve, reject) => {

			sql.query("SELECT * FROM users WHERE id = ?", [id]).then(([result]) => {

				const array = Array.from(result as any[]);

				if (array.length == 0) return resolve(null);

				resolve({ ...array[0], admin: BigInt(array[0].admin), name: JSON.parse(array[0].name) } as User);

			});

		});

	}

	export async function makeUser(id: string, password: string, name: [string] | [string, string] | [string, string, string], grade: number): Promise<User> {

		return new Promise<User>((resolve, reject) => {

			sql.query("INSERT INTO users (id, password, rating, name, grade, admin) VALUES (?, ?, 1200, ?, ?, 0)", [id, crypto.createHash("sha256").update(password).digest("hex"), JSON.stringify(name), grade]).then(([result]) => {

				resolve(getUser(id) as Promise<User>);

			});

		});

	}

}
