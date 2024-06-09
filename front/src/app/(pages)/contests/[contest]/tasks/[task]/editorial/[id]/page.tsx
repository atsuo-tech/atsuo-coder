import styles from "../global.module.css";
import getProblem from "@/lib/problem"
import { notFound } from "next/navigation";
import fs from "fs";
import Markdown from "@/components/markdown";

export default async function Editorial({
	params: { task: task_id, id }
}: {
	params: {
		task: string,
		id: string
	}
}) {

	const task = await getProblem(task_id);

	if (!task) {

		notFound();

	}

	if (!fs.statSync(`./static/editorials/${task_id}/${id}`, { throwIfNoEntry: true })?.isDirectory()) {

		notFound();

	}

	const data = JSON.parse(fs.readFileSync(`./static/editorials/${task_id}/${id}/data.json`, 'utf-8'));

	return (
		<div className={styles.editorials}>
			<h1>{await task.name!!.get()} Editorial</h1>
			<p>By {data.author}</p>
			<hr />
			<div className={styles.text}>
				<Markdown md={fs.readFileSync(`./static/editorials/${task_id}/${id}/text.md`, 'utf-8')} />
			</div>
		</div>
	)

}