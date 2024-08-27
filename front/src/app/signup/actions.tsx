"use server";

import Accounts from "@/lib/accounts";
import { redirect } from "next/navigation";

export async function Form(formData: FormData) {

	const username = formData.get("username") as string;
	const password = formData.get("password") as string;
	const grade = formData.get("grade") as string;
	const name1 = formData.get("name1") as string;
	const name2 = formData.get("name2") as string;
	const name3 = formData.get("name3") as string;

	if (await Accounts.User.getUserByID(username) != null) {

		redirect("/signup?error=1");

	}

	await Accounts.User.makeUser(username, password, [name1, name2, name3].filter(Boolean) as [string] | [string, string] | [string, string, string], Number(grade));

	await Accounts.User.login(username);

	redirect("/");

}
