import styles from "../form.module.css";
import PostDeleteContest from "./post";

export default async function Page({ searchParams }: { searchParams: { id?: string } }) {

	if (!searchParams.id) {

		return (
			<>
				<h1>Delete Contest | AtsuoCoder Admin</h1>
				<div className={styles.body1}>
					<form action="/admin/contests/delete" method="get">
						<label htmlFor="id">ID</label>
						<br />
						<input name="id" id="id" type="text" autoComplete="on" placeholder="aac001" required />
						<br />
						<input type="submit" defaultValue="Delete" className={styles.delete} />
					</form>
				</div>
			</>
		);

	} else {

		return await PostDeleteContest(searchParams.id);

	}

}