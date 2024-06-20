import { notFound } from "next/navigation";
import styles from "./page.module.css";
import Markdown from "@/components/markdown";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";
import Language from "@/lib/language";

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

	// コンテスト終了後か
	const contestEnded = period != -1 && start.getTime() + period < Date.now();

	// Rated登録済みか
	const isRated = user && (await contest.rated_users!!.get()).includes(user.getID()!!);

	// Unrated登録済みか
	const isUnrated = user && (await contest.unrated_users!!.get()).includes(user.getID()!!);

	// 編集者か
	const isEditor = user && (await contest.editors!!.get()).includes(user.getID()!!);

	// テスターか
	const isTester = user && (await contest.testers!!.get()).includes(user.getID()!!);

	// 運営か
	const isManager = isEditor || isTester;

	return (
		<>
			<div className={styles.contest_title}>

				<h1>{await contest.name!!.get()}</h1>


				<ul>
					{contestNotStarted && !isManager && !isRated ? <a href={`/contests/${p.params.contest}/register/rated`} className={styles.rated_button}>{isUnrated ? "Rated登録に変更" : "Rated登録"}</a> : <></>}
					{!contestEnded && !isManager && !isUnrated ? <a href={`/contests/${p.params.contest}/register/unrated`} className={styles.unrated_button}>{isRated ? "Unrated登録に変更" : "Unrated登録"}</a> : <></>}
					{contestNotStarted && !isManager && (isRated || isUnrated) ? <a href={`/contests/${p.params.contest}/register/cancel`} className={styles.cancel_button}>登録解除</a> : <></>}
				</ul>

				<p>
					<Language>editors</Language>: {editors.join(' ')} | <Language>testers</Language>: {testers.length != 0 ? testers.join(' ') : "None"}<br />
					<Language>rated</Language>: {rated || "無制限"} | <Language>start</Language>: {start.toLocaleString("ja")} | <Language>end</Language>: {period == -1 ? "Infinity" : new Date(start.getTime() + period).toLocaleString("ja")} | <Language>type</Language>: {isPublic ? "Public" : "Private"}
				</p>

			</div>

			<br />

			<div id="description" className={styles.description}>
				<Markdown md={description} />
			</div>
		</>
	)

}
