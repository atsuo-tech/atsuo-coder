import Form from "@/components/form";
import styles from "../form.module.css";
import Warning from "@/components/form/warnings";

export default async function Page() {

	return (
		<>
			<h1>New Tasks | AtsuoCoder Admin</h1>
			<Form action="/admin/tasks/post/new" method="post">
				<label htmlFor="name">Name</label>
				<br />
				<input name="name" id="name" type="text" autoComplete="on" placeholder="A. console.log" required />
				<br />
				<label htmlFor="id">ID</label>
				<br />
				<input name="id" id="id" type="text" autoComplete="on" placeholder="aac001_a" required />
				<br />
				<Warning>
					警告：<a href="/reserved.json"><u>予約語</u></a>は含めないでください。
				</Warning>
				<label htmlFor="editors">Editors</label>
				<br />
				<input name="editors" id="editors" type="text" required placeholder="yama_can" />
				<br />
				<label htmlFor="testers">Testers</label>
				<br />
				<input name="testers" id="testers" type="text" required placeholder="abn48" />
				<br />
				<label htmlFor="question">Question</label>
				<br />
				<textarea name="question" id="question" placeholder="Hello, world!と出力しなさい。"></textarea>
				<input type="submit" defaultValue="Create" />
			</Form>
		</>
	);

}