import Form from "@/components/form";
import styles from "../form.module.css";
import PostDeleteTestcase from "./post";

export default async function Page({ searchParams }: { searchParams: { id?: string, task_id?: string } }) {

	if (searchParams.id && searchParams.task_id) {

		return await PostDeleteTestcase(searchParams.task_id, searchParams.id);

	} else {

		return (
			<>
				<h1>Delete Testcase | AtsuoCoder Admin</h1>
				<Form action="/admin/testcases/delete" method="get">
					<label htmlFor="task_id">Task ID</label>
					<br />
					<input name="task_id" id="task_id" type="text" autoComplete="on" placeholder="aac001_a" required />
					<br />
					<label htmlFor="id">ID</label>
					<br />
					<input name="id" id="id" type="text" autoComplete="on" placeholder="test_a" required />
					<br />
					<input type="submit" defaultValue="Delete" className={styles.delete} />
				</Form>
			</>
		);

	}

}