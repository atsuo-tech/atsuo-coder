import styles from "../form.module.css";
import getContest from "@/lib/contest";
import { notFound } from "next/navigation";

export default async function PostDeleteContest(id: string) {

	const contest = await getContest(id);

	if (!contest) {

		notFound();

	}

	return (
		<>
			<h1>Delete Contest | AtsuoCoder Admin</h1>
			<p>Deleting {id}</p>
			<br />
			<div className={styles.body1}>
				<form action="/admin/contests/post/delete" method="post">
					<input type="hidden" name="id" defaultValue={id} />
					<p>Are you sure to delete this contest <code>{id}</code>?</p>
					<br />
					<input name="check" id="check" type="checkbox" required className={styles.check} />
					<label htmlFor="check">Yes, I&apos;m sure.</label>
					<br />
					<p>Even if you delete the contest, it will remain in the cache for a while.</p>
					<br />
					<input type="submit" defaultValue="Delete" className={styles.delete} />
				</form>
			</div>
		</>
	);

}