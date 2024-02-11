import "./layout.css";
import styles from "./layout.module.css";

import 'zenn-content-css';
import { Permissions } from "@/lib/user";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";
import { notFound } from "next/navigation";

export default async function RootLayout({
	children,
	params
}: {
	children: React.ReactNode,
	params: { [key: string]: string }
}) {

	const user = await getUser();

	const contestInfo = await getContest(params.contest);

	if (!contestInfo) {

		notFound();

	}

	// 権限的に許可されているか
	const permissionAllowed =
		user &&
		(
			Permissions.hasPermission(await user.permission!!.get(), Permissions.BasePermissions.ContestAdmin) ||
			(await contestInfo.owner!!.get()) == user.getID() ||
			(await contestInfo.editors!!.get()).includes(user.getID()!!) ||
			(await contestInfo.testers!!.get()).includes(user.getID()!!)
		);

	// 登録済みか
	const userRegistered = user && (
		(await contestInfo.rated_users!!.get()).includes(user.getID()!!) ||
		(await contestInfo.unrated_users!!.get()).includes(user.getID()!!)
	);

	// コンテストが開始前か
	const contestNotStarted = (await contestInfo.start!!.get()).getTime() > Date.now();

	// コンテストが終了後か
	const contestEnded = (await contestInfo.start!!.get()).getTime() + await contestInfo.period!!.get() < Date.now();

	// コンテストが公開されているか
	const contestPublic = await contestInfo.public!!.get();

	// コンテストが行われているか
	const contestRunning = !contestNotStarted && !contestEnded;

	// 問題にアクセスできるか
	const permissionAllowedTask = permissionAllowed || (contestRunning && userRegistered);

	if (!contestPublic && !permissionAllowed) {

		notFound();

	}

	return (
		<>
			{children}
			<div className={styles.contest}>
				<div className={styles.tab}>
					<ul>
						<div className="pagenow">
							<a href={`/contests/${params.contest}`}>
								<li>
									<span className={styles["material-icons"]}>home</span>
									<br />
									Top
								</li>
							</a>
						</div>
						{
							permissionAllowedTask ?
								<a href={`/contests/${params.contest}/tasks`}>
									<li>
										<span className={styles["material-icons"]}>
											task
										</span>
										<br />
										Tasks
									</li>
								</a> :
								<></>
						}
						<a href={`/contests/${params.contest}/standings`}>
							<li>
								<span className={styles["material-icons"]}>
									leaderboard
								</span>
								<br />
								Standings
							</li>
						</a>
						{
							permissionAllowedTask ?
								<a href={`/contests/${params.contest}/submissions`}>
									<li>
										<span className={styles["material-icons"]}>
											send
										</span>
										<br />
										Submittions
									</li>
								</a> :
								<></>
						}
					</ul>
				</div>
			</div>
			<div data-center="none"></div>
		</>
	)
}