import getContest from "@/lib/contest";
import getUser from "@/lib/user";
import { notFound } from "next/navigation";
import React from "react";

export default async function Layout({
	children,
	params: {
		contest: contest_id
	}
}: {
	children?: React.ReactNode,
	params: {
		contest: string
	}
}) {

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const contest = await getContest(contest_id)!!;

	if (!contest) {

		notFound();

	}

	const isEditor = (await contest.editors!!.get()).includes(user.getID()!!);
	const isTester = (await contest.testers!!.get()).includes(user.getID()!!);

	const period = await contest.period!!.get();
	const start = await contest.start!!.get();

	// コンテスト終了後か
	const contestEnded = period != -1 && (start.getTime() + period < Date.now());

	// 運営か
	const isManager = isEditor || isTester;

	if (!contestEnded && !isManager) {

		notFound();

	}

	return <>{children}</>;

}