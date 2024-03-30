import Form from "@/components/form";
import styles from "../form.module.css";
import PostEditContest from "./post";

export default async function Page({ searchParams }: { searchParams: { id?: string } }) {

	if (!searchParams.id) {

		return (
			<>
				<h1>Edit Contest | AtsuoCoder Admin</h1>
				<Form action="/admin/contests/edit" method="get">
					<label htmlFor="id">ID</label>
					<br />
					<input name="id" id="id" type="text" autoComplete="on" placeholder="aac001" required />
					<br />
					<input type="submit" defaultValue="Edit" />
				</Form>
			</>
		);

	} else {

		return await PostEditContest(searchParams.id);

	}

}