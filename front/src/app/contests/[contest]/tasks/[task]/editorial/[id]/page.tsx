import styles from "../global.module.css";
import getProblem from "@/lib/problem"
import { notFound } from "next/navigation";
import fs from "fs";
import Markdown from "@/components/markdown";
import Language from "@/lib/languages";
import getUser from "@/lib/user";

export default async function Editorial({
	params: { contest: contest_id, task: task_id, id }
}: {
	params: {
		contest: string,
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

	const user = await getUser();

	return (
		<div className={styles.editorials}>
			<h1>{data.name} | {await task.name!!.get()} <Language>editorial</Language></h1>
			<p>By {data.author}</p>
			<hr />
			{
				data.author == user?.getID() ?
					<>
						<p>著者オプション</p>
						<a href={`/contests/${contest_id}/tasks/${task_id}/editorial/${id}/edit`}><span className="material-icons">edit</span></a>
						<a href={`/contests/${contest_id}/tasks/${task_id}/editorial/${id}/delete`}><span className="material-icons">delete</span></a>
						<hr />
					</> :
					<></>
			}
			<div className={styles.text}>
				<Markdown md={fs.readFileSync(`./static/editorials/${task_id}/${id}/text.md`, 'utf-8')} />
			</div>
		</div>
	)

}