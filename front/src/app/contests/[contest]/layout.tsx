import "./layout.css";
import styles from "./layout.module.css";

import 'zenn-content-css';
import { Permissions } from "@/lib/user";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";
import { notFound } from "next/navigation";

import { SiteHeader, SecondHeader, Header1Button, Header2Button, HeaderUserName, HeaderUserButton, ThirdHeader, Header3Button, FourthHeader, ContestTitle } from '../../../components/styled-components';
import Language from "@/lib/languages";
import MobileMenu from "./menu";

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
	const permissionAllowedTask = permissionAllowed || userRegistered || contestEnded;

	if (!contestPublic && !permissionAllowed) {

		notFound();

	}

	return (
		<>
			<ThirdHeader className={styles.desktop}>
				<h2><Language>menu</Language></h2>
				<Header3Button>
					<a href={`/contests/${params.contest}`}>
						<span className={styles["material-icons"]}>home</span>
						<p><Language>top</Language></p>
					</a>
				</Header3Button>
				{
					permissionAllowedTask ?
						<Header3Button>
							<a href={`/contests/${params.contest}/tasks`}>
								<span className={styles["material-icons"]}>task</span>
								<p><Language>tasks</Language></p>
							</a>
						</Header3Button> :
						<></>
				}
				<Header3Button>
					<a href={`/contests/${params.contest}/standings`}>
						<span className={styles["material-icons"]}>leaderboard</span>
						<p><Language>standings</Language></p>
					</a>
				</Header3Button>
				{
					permissionAllowedTask ?
						<Header3Button>
							<a href={`/contests/${params.contest}/submissions`}>
								<span className={styles["material-icons"]}>send</span>
								<p><Language>submissions</Language></p>
							</a>
						</Header3Button> :
						<></>
				}
				<Header3Button>
					<a href={`/contests/${params.contest}/clar`}>
						<span className={styles["material-icons"]}>forum</span>
						<p><Language>clar</Language></p>
					</a>
				</Header3Button>
			</ThirdHeader>

			<MobileMenu problems={permissionAllowedTask} standings={true} submissions={permissionAllowedTask} contestUrl={`/contests/${params.contest}`} />
			
			{children}
		</>
	)
}