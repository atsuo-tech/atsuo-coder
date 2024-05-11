import { Token, User } from "./types";
import { Detail } from "./detail";
import { cookies } from "next/headers";

export namespace Server {

	export async function getToken(cookie = cookies()): Promise<Token | null> {

		"use server";

		if (cookie.get("cc") === undefined || cookie.get("ct") === undefined) return null;

		return Detail.getToken(cookie.get("cc")!!.value, cookie.get("ct")!!.value);

	}

	export async function makeToken(user: string): Promise<Token> {

		"use server";

		return Detail.makeToken(user);

	}

	export async function getUser(cookie = cookies()): Promise<User | null> {

		"use server";

		if (cookie.get("cc") === undefined || cookie.get("ct") === undefined) return null;

		const token = await Detail.getToken(cookie.get("cc")!!.value, cookie.get("ct")!!.value);

		if (token === null) return null;

		const user = await Detail.getUser(token.user);

		if (user === null) return null;

		return user;

	}

	export async function getUserByID(id: string): Promise<User | null> {

		return Detail.getUser(id);

	}

	export async function makeUser(id: string, password: string, name: [string] | [string, string] | [string, string, string], grade: number): Promise<User> {

		return Detail.makeUser(id, password, name, grade);

	}

	export async function login(user: string): Promise<Token | null> {

		return new Promise<Token | null>(async (resolve, reject) => {

			const token = await Server.makeToken(user);

			cookies().set("cc", token.cc, { maxAge: 60 * 60 * 24 * 365 });
			cookies().set("ct", token.ct, { maxAge: 60 * 60 * 24 * 365 });

			resolve(token);

		});

	}

}
