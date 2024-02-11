import { sql } from "@/app/sql";
import redis from "@/app/redis";
import { redirect } from "next/navigation";
import getUser from "@/lib/user";

export default async function Page({ params: { contest } }: { params: { contest: string } }) {

	const sqlResult = (await sql.query("SELECT rated_users, unrated_users FROM contests WHERE id = ?", [contest]) as any)[0][0];

	let rated_users = JSON.parse(sqlResult.rated_users) as string[];
	const unrated_users = JSON.parse(sqlResult.unrated_users) as string[];

	const user = await getUser();

	if (!user) {

		return redirect("/login");

	}

	if (unrated_users.includes(user.getID()!!)) {

		return redirect(`/contests/${contest}`);

	}


	if (rated_users.includes(user.getID()!!)) {

		rated_users = rated_users.filter((v) => v != user.getID());
		await sql.query("UPDATE contests SET rated_users = ? WHERE id = ?", [JSON.stringify(rated_users), contest]);

	}

	unrated_users.push(user.getID()!!);

	await sql.query("UPDATE contests SET unrated_users = ? WHERE id = ?", [JSON.stringify(unrated_users), contest]);

	await redis.del(`contest:${contest}`);

	return redirect(`/contests/${contest}`);

}