import { RedirectType, notFound, redirect } from "next/navigation";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";

export default async function Page({ params: { contest } }: { params: { contest: string } }) {

	const contestInfo = await getContest(contest);

	const start = await contestInfo!!.start!!.get();

	if (start.getTime() < Date.now()) {

		notFound();

	}

	const rated_users = await contestInfo!!.rated_users!!.get();
	const unrated_users = await contestInfo!!.unrated_users!!.get();

	const user = await getUser();

	if (!user) {

		redirect("/login", RedirectType.push);

	}

	if (rated_users.includes(user.getID()!!)) {

		redirect(`/contests/${contest}`, RedirectType.push);

	}

	if (unrated_users.includes(user.getID()!!)) {

		await contestInfo!!.unrated_users!!.set(unrated_users.filter((value) => value != user.getID()!!));

	}

	await contestInfo!!.rated_users!!.set([...rated_users, user.getID()!!]);

	redirect(`/contests/${contest}`, RedirectType.push);

}