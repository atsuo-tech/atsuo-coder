import Form from "@/components/form";
import styles from "../form.module.css";
import PostNewTestcase from "./post";
import Warning from "@/components/form/warnings";

export default async function Page({ searchParams }: { searchParams: { id?: string } }) {

	if (searchParams.id) {

		return await PostNewTestcase(searchParams.id);

	}

	return (
		<>
			<h1>New Testcase | AtsuoCoder Admin</h1>
			<Form action="/admin/testcases/new" method="get">
				<label htmlFor="id">Task ID</label>
				<br />
				<input name="id" id="id" type="text" autoComplete="on" placeholder="aac001_a" required />
				<br />
				<Warning>
					<ul>
						<li> Warning: Do not include <a href="/reserved.json"><u>reserved strings</u></a>.</li>
					</ul>
				</Warning>
				<br />
				<input type="submit" defaultValue="Next" />
			</Form>
		</>
	)
}