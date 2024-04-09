import { notFound, redirect } from "next/navigation";
import Waiter from "./waiter";
import getUser from "@/lib/user";
import getContest, { Contest } from "@/lib/contest";

export default async function WaiterPage({
	params
}: {
	params: { [key: string]: string }
}) {

	const contest = await getContest(params.contest) as Contest;

	const user = await getUser();
	const editors = await contest.editors!!.get();
	const testers = await contest.testers!!.get();
	const rated_users = await contest.rated_users!!.get();
	const unrated_users = await contest.unrated_users!!.get();

	// コンテスト開始前

	if (!user || (!editors.includes(user.getID()!!) && !testers.includes(user.getID()!!))) {

		if (user && (rated_users.includes(user.getID()!!) || unrated_users.includes(user.getID()!!))) {

			return (
				<>
					<h1>Tasks | AtsuoCoder</h1>
					<p>コンテストはまだ始まっていません。</p>
					<Waiter start={await contest.start?.get()!!} url={`/contests/${params.contest}/tasks`}></Waiter>
				</>
			);

		}

		notFound();

	}
	
	redirect(`/contests/${params.contest}/tasks`);

}
