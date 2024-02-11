import styles from "./page.module.css";

export default async function Page() {
	return (
		<>
			<h1>Tasks | AtsuoCoder Admin</h1>
			<ul className={styles.buttons}>
				<a href="/admin/tasks/new">
					<li>
						<span className={styles["material-icons"]}>add</span>
						New Tasks
					</li>
				</a>
				<a href="/admin/tasks/edit">
					<li>
						<span className={styles["material-icons"]}>edit</span>
						Edit Tasks
					</li>
				</a>
				<a href="/admin/tasks/delete">
					<li>
						<span className={styles["material-icons"]}>delete</span>
						Delete Tasks
					</li>
				</a>
			</ul>
		</>
	)
}