import getContest from "@/lib/contest";
import getUser from "@/lib/user";
import { notFound } from "next/navigation";
import Waiter from "./waiter";

export default async function RootLayout({
	children,
	params
}: {
	children?: React.ReactNode
	component: React.ReactNode
	params?: any
}) {

	const contest = await getContest(params.contest);

	if (!contest) {

		notFound();

	}

	const start = await contest.start!!.get();
	const period = await contest.period!!.get();
	const editors = await contest.editors!!.get();
	const testers = await contest.testers!!.get();
	const rated_users = await contest.rated_users!!.get();
	const unrated_users = await contest.unrated_users!!.get();

	const contestStarted = start.getTime() <= Date.now();
	const contestEnded = start.getTime() + period <= Date.now();

	const user = await getUser();

	if (!contestStarted) {

		// コンテスト開始前

		if (!user || (!editors.includes(user.getID()!!) && !testers.includes(user.getID()!!))) {

			if (user && (rated_users.includes(user.getID()!!) || unrated_users.includes(user.getID()!!))) {

				return (
					<>
						<h1>Tasks | AtsuoCoder</h1>
						<p>コンテストはまだ始まっていません。</p>
						<Waiter start={await contest.start?.get()!!}></Waiter>
					</>
				);

			}

			notFound();

		}

	} else if (!contestEnded) {

		// コンテスト実施中

		if (!user || (!editors.includes(user.getID()!!) && !testers.includes(user.getID()!!) && !rated_users.includes(user.getID()!!) && !unrated_users.includes(user.getID()!!))) {

			notFound();

		}

	}

	// コンテスト終了後の制約はありません。

	return <>{children}</>;

}
