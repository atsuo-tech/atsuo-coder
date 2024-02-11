import styles from "../form.module.css";
import PostNewTestcase from "./post";

export default async function Page({ searchParams }: { searchParams: { id?: string } }) {

	if (searchParams.id) {

		return await PostNewTestcase(searchParams.id);

	}

	return (
		<>
			<h1>New Testcase | AtsuoCoder Admin</h1>
			<div className={styles.body1}>
				<form action="/admin/testcases/new" method="get">
					<label htmlFor="id">Task ID</label>
					<br />
					<input name="id" id="id" type="text" autoComplete="on" placeholder="aac001_a" required />
					<br />
					<label htmlFor="id" className={`${styles.warning} ${styles.show}`} id="id-warning">
						<ul>
							<li> Warning: Do not include <a href="/reserved.json"><u>reserved strings</u></a>.</li>
						</ul>
					</label>
					<br />
					<input type="submit" defaultValue="Next" />
				</form>
			</div>
		</>
	)
}