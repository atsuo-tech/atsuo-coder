import Form from "@/components/form";
import styles from "../form.module.css";
import PostEditTestcase from "./post";

export default async function Page({ searchParams }: { searchParams: { id?: string, task_id?: string } }) {

	if (searchParams.id && searchParams.task_id) {

		return await PostEditTestcase(searchParams.id, searchParams.task_id);

	} else {

		return (
			<>
				<h1>Edit Testcases | AtsuoCoder Admin</h1>
				<Form action="/admin/testcases/edit" method="get">
					<label htmlFor="task_id">Task ID</label>
					<br />
					<input name="task_id" id="task_id" type="text" autoComplete="on" placeholder="aac001_a" required />
					<br />
					<label htmlFor="id">ID</label>
					<br />
					<input name="id" id="id" type="text" autoComplete="on" placeholder="test_a" required />
					<input type="submit" defaultValue="Next" />
				</Form>
			</>
		);

	}

}