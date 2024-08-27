"use server";

import { redirect } from "next/navigation";
import crypto from "crypto";
import Accounts from "@/lib/accounts";
import getUser from "@/lib/user";

export async function Form(formData: FormData) {

	const rawFormData = {

		id: formData.get("id") as string,
		password: formData.get("password") as string

	};

	if (!rawFormData.id || !rawFormData.password) redirect("/login?error=1");

	const user = await getUser(rawFormData.id);

	if (!user) redirect("/login?error=2");

	const hash = crypto.createHash("sha256").update(rawFormData.password).digest("hex");

	if (!user || await user.password!!.get() != crypto.createHash("sha256").update(rawFormData.password).digest("hex")) redirect("/login?error=2");

	await Accounts.User.login(user.getID()!!);

	redirect("/");

}
