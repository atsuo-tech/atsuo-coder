import PostEditContest from "../../contests/edit/post";
import styles from "../form.module.css";

export default async function Page({ searchParams }: { searchParams: { id?: string } }) {

	if (!searchParams.id) {

		return (
			<>
				<h1>Edit Tasks | AtsuoCoder Admin</h1>
				<div className={styles.body1}>
					<form action="/admin/tasks/edit" method="get">
						<label htmlFor="id">ID</label>ssqss
						<br />
						<input name="id" id="id" type="text" autoComplete="on" placeholder="aac001" required />
						<br />
						<input type="submit" defaultValue="Edit" />
					</form>
				</div>
			</>
		)

	} else {

		return await PostEditContest(searchParams.id);

	}

}