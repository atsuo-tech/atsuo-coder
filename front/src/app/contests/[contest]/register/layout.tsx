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

	return <>{children}</>;

}