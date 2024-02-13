import { notFound, redirect } from "next/navigation";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";

export default async function RootLayout({
	children,
	params
}: {
	children: React.ReactNode,
	params: { [key: string]: string }
}) {

	const user = await getUser();

	if (!user) {

		redirect("/login");

	}

	const contest = await getContest(params.contest);

	if (!contest) {

		notFound();

	}

	const start = await contest.start!!.get();
	const period = await contest.period!!.get();

	if (start.getTime() + period > Date.now()) {

		notFound();

	}

	return <>{children}</>;

}