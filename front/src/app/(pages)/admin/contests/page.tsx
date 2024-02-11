import { hasContestMakerPermission } from "../permission";
import styles from "./page.module.css";

export default async function Page() {
	return (
		<>
			<h1>Contests | AtsuoCoder Admin</h1>
			<ul className={styles.buttons}>
				{
					await hasContestMakerPermission() ?
						<a href="/admin/contests/new">
							<li>
								<span className={styles["material-icons"]}>add</span>
								New Contest
							</li>
						</a> :
						<p>Your permissions do not allow you to create new contests.</p>
				}
				<a href="/admin/contests/edit">
					<li>
						<span className={styles["material-icons"]}>edit</span>
						Edit Contest
					</li>
				</a>
				<a href="/admin/contests/delete">
					<li>
						<span className={styles["material-icons"]}>delete</span>
						Delete Contest
					</li>
				</a>
			</ul>
		</>
	)
}