import getContest, { Contest, getPublicContests } from "@/lib/contest";
import Language from "@/lib/language";
import getUser from "@/lib/user";
import { ReactNode } from "react";

export default async function Page(params: { searchParams: { [key: string]: string } }) {

	const user = await getUser();

	const contests = await Promise.all((await user?.contests.get() || await getPublicContests()).map((id) => getContest(id)));

	const permanent_contests: Contest[] = [];
	const active_contests: Contest[] = [];
	const upcoming_contests: Contest[] = [];
	const recent_contests: Contest[] = [];

	for (const contest of contests) {

		if (contest == null) {

			continue;

		}

		const period = await contest.period!!.get();
		const start = await contest.start!!.get();

		if (period == -1) {

			permanent_contests.push(contest);

		} else if (start.getTime() <= Date.now() && start.getTime() + period >= Date.now()) {

			active_contests.push(contest);

		} else if (start.getTime() > Date.now()) {

			upcoming_contests.push(contest);

		} else {

			recent_contests.push(contest);

		}

	}


	return (
		<>
			<h1>Contests</h1>
			<p>コンテスト一覧です</p>

			<h2><Language>permanent_contests</Language></h2>

			<div>

				<table id="inf-con">
					<thead>
						<tr>
							<td width="20%"><Language>start</Language></td>
							<td width="10%"><Language>type</Language></td>
							<td width="50%"><Language>contest_name</Language></td>
							<td width="10%"><Language>rated</Language></td>
							<td width="10%"><Language>period</Language></td>
						</tr>
					</thead>
					<tbody>
						{
							await (async () => {

								const data: ReactNode[] = [];

								for (const contest of permanent_contests) {

									const period = await contest.period!!.get() / 1000;
									const start = await contest.start!!.get();

									data.push(
										<tr key={contest.id}>
											<td>{start.toLocaleString("ja")}</td>
											<td>{(await contest.public?.get()) ? "公開" : "非公開"}</td>
											<td><a href={`/contests/${contest.id}`}>{await contest.name?.get()}</a></td>
											<td>{await contest.rated?.get()}</td>
											<td>Infinity</td>
										</tr>
									);

								}

								if (permanent_contests.length == 0) {
									return (
										<tr>
											<td colSpan={5}>
												現在常設中のコンテストはありません。
											</td>
										</tr>
									);
								}

								else {
									return data;
								}
							})()
						}
					</tbody>
				</table>

			</div>

			<h2><Language>active_contests</Language></h2>

			<div>

				<table id="now-con">
					<thead>
						<tr>
							<td width="20%"><Language>start</Language></td>
							<td width="10%"><Language>type</Language></td>
							<td width="50%"><Language>contest_name</Language></td>
							<td width="10%"><Language>rated</Language></td>
							<td width="10%"><Language>period</Language></td>
						</tr>
					</thead>
					<tbody>
						{
							await (async () => {

								const data: ReactNode[] = [];

								for (const contest of active_contests) {

									const period = await contest.period!!.get() / 1000;
									const start = await contest.start!!.get();

									data.push(
										<tr key={contest.id}>
											<td>{start.toLocaleString("ja")}</td>
											<td>{(await contest.public?.get()) ? "公開" : "非公開"}</td>
											<td><a href={`/contests/${contest.id}`}>{await contest.name?.get()}</a></td>
											<td>{await contest.rated?.get()}</td>
											<td>{`${Math.floor((period - (period - period % 60) % 3600) / 3600)}:${Math.floor(((period - period % 60) % 3600) / 60)}:${period % 60}`}</td>
										</tr>
									);

								}

								if (active_contests.length == 0) {
									return (
										<tr>
											<td colSpan={5}>
												現在開催中のコンテストはありません。
											</td>
										</tr>
									);
								}

								else {
									return data;
								}
							})()
						}
					</tbody>
				</table>

			</div>

			<h2><Language>upcoming_contests</Language></h2>

			<div>

				<table id="bef-con">
					<thead>
						<tr>
							<td width="20%"><Language>start</Language></td>
							<td width="10%"><Language>type</Language></td>
							<td width="50%"><Language>contest_name</Language></td>
							<td width="10%"><Language>rated</Language></td>
							<td width="10%"><Language>period</Language></td>
						</tr>
					</thead>
					<tbody>
						{
							await (async () => {

								const data: ReactNode[] = [];

								for (const contest of upcoming_contests) {

									const period = await contest.period!!.get() / 1000;
									const start = await contest.start!!.get();

									data.push(
										<tr key={contest.id}>
											<td>{start.toLocaleString("ja")}</td>
											<td>{(await contest.public?.get()) ? "公開" : "非公開"}</td>
											<td><a href={`/contests/${contest.id}`}>{await contest.name?.get()}</a></td>
											<td>{await contest.rated?.get()}</td>
											<td>{`${Math.floor((period - (period - period % 60) % 3600) / 3600)}:${Math.floor(((period - period % 60) % 3600) / 60)}:${period % 60}`}</td>
										</tr>
									);

								}

								if (upcoming_contests.length == 0) {
									return (
										<tr>
											<td colSpan={5}>
												現在予定中のコンテストはありません。
											</td>
										</tr>
									);
								}
								else {
									return data;
								}
							})()
						}
					</tbody>
				</table>

			</div>

			<h2><Language>recent_contests</Language></h2>

			<div>

				<table id="aft-con">
					<thead>
						<tr>
							<td width="20%"><Language>start</Language></td>
							<td width="10%"><Language>type</Language></td>
							<td width="50%"><Language>contest_name</Language></td>
							<td width="10%"><Language>rated</Language></td>
							<td width="10%"><Language>period</Language></td>
						</tr>
					</thead>
					<tbody>
						{
							await (async () => {

								const data: ReactNode[] = [];

								for (const contest of recent_contests) {

									const period = await contest.period!!.get() / 1000;
									const start = await contest.start!!.get();

									data.push(
										<tr key={contest.id}>
											<td>{start.toLocaleString("ja")}</td>
											<td>{(await contest.public?.get()) ? "公開" : "非公開"}</td>
											<td><a href={`/contests/${contest.id}`}>{await contest.name?.get()}</a></td>
											<td>{await contest.rated?.get()}</td>
											<td>{`${Math.floor((period - (period - period % 60) % 3600) / 3600)}:${Math.floor(((period - period % 60) % 3600) / 60)}:${period % 60}`}</td>
										</tr>
									);

								}

								if (recent_contests.length == 0) {
									return (
										<tr>
											<td colSpan={5}>
												終了後のコンテストはありません。
											</td>
										</tr>
									);
								}

								else {
									return data;
								}
							})()
						}
					</tbody>
				</table>

			</div>

		</>
	)
}
