import { Contest, getManagaedContests } from "@/lib/contest";
import { hasContestMakerPermission } from "../../../lib/accounts/permission";
import styles from "./page.module.css";
import getUser from "@/lib/user";

export default async function Page() {

	const user = await getUser();

	const contests = await getManagaedContests(user?.getID()!!, false);

	return (
		<>
			<h1>Contests | AtsuoCoder Admin</h1>
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>開始</th>
						<th>状態</th>
						<th>コンテスト名</th>
						<th>期間</th>
						<th>操作</th>
					</tr>
				</thead>
				<tbody>
					{
						await hasContestMakerPermission() ?
							<tr>
								<td colSpan={6}>
									<a href="/admin/contests/new">
										<span className={styles["material-icons"]}>add</span>
										New Contest
									</a>
								</td>
							</tr> :
							<></>
					}
					{
						await Promise.all(
							(contests as Contest[]).map(async (contest, i) => {
								const period = await contest.period!!.get();
								return (
									<tr key={i}>
										<td>{contest.id}</td>
										<td>{(await contest.start!!.get()).toLocaleString("ja-jp")}</td>
										<td>{(await contest.public!!.get()) ? "公開" : "非公開"}</td>
										<td>{await contest.name!!.get()}</td>
										<td>{period == -1 ? "inf" : period}</td>
										<td>
											<a href={`/admin/contests/edit?id=${contest.id}`}>
												<span className={styles["material-icons"]}>edit</span>
											</a>
											<a href={`/admin/contests/delete?id=${contest.id}`}>
												<span className={styles["material-icons"]}>delete</span>
											</a>
										</td>
									</tr>
								)
							})
						)
					}
				</tbody>
			</table>
		</>
	)
}