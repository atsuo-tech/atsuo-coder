import { notFound } from "next/navigation";
import styles from "./page.module.css";
import Markdown from "@/components/markdown";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";

export default async function Page(p: { params: { contest: string } }) {

	const contest = await getContest(p.params.contest);

	if (!contest) {

		notFound();

	}

	const user = await getUser();

	const editors = await contest.editors!!.get();
	const testers = await contest.testers!!.get();
	const rated = await contest.rated!!.get();
	const start = await contest.start!!.get();
	const period = await contest.period!!.get();
	const isPublic = await contest.public!!.get();
	const description = await contest.description!!.get();

	// コンテスト開始前か
	const contestNotStarted = start.getTime() > Date.now();

	// Rated登録済みか
	const isRated = user && (await contest.rated_users!!.get()).includes(user.getID()!!);

	// Unrated登録済みか
	const isUnrated = user && (await contest.unrated_users!!.get()).includes(user.getID()!!);

	return (
		<>
			<div className={styles.contest_title}>

				<h1>{await contest.name!!.get()}</h1>

				{contestNotStarted ? <></> :
					<ul>
						<a href={`/contests/${p.params.contest}/register/rated`} className={styles.rated_button}>{isUnrated ? "Rated登録に変更" : "Rated登録"}</a>
						<a href={`/contests/${p.params.contest}/register/unrated`} className={styles.unrated_button}>{isRated ? "Unrated登録に変更" : "Unrated登録"}</a>
						<a href={`/contests/${p.params.contest}/register/cancel`} className={styles.cancel_button}>登録解除</a>
					</ul>
				}

				<p>
					Editor: {editors.join(' ')} | Tester: {testers.length != 0 ? testers.join(' ') : "None"}<br />
					Rated: {rated || "無制限"} | Start: {start.toLocaleString("ja")} | End: {new Date(start.getTime() + period).toLocaleString("ja")} | Type: {isPublic ? "Public" : "Private"}
				</p>

			</div>

			<br />

			<div id="description" className={styles.description}>
				<div id="description">
					<Markdown md={description} />
				</div>
			</div>
		</>
	)

}
