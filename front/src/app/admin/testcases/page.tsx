import styles from "./page.module.css";

export default async function Page() {
	return (
		<>
			<h1>Testcases | AtsuoCoder Admin</h1>
			<ul className={styles.buttons}>
				<a href="/admin/testcases/new">
					<li>
						<span className={styles["material-icons"]}>add</span>
						New Testcases
					</li>
				</a>
				<a href="/admin/testcases/edit">
					<li>
						<span className={styles["material-icons"]}>edit</span>
						Edit Testcases
					</li>
				</a>
				<a href="/admin/testcases/delete">
					<li>
						<span className={styles["material-icons"]}>delete</span>
						Delete Testcases
					</li>
				</a>
			</ul>
		</>
	)
}