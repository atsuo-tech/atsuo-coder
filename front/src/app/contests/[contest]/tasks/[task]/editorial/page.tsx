import styles from "./global.module.css";
import getProblem from "@/lib/problem"
import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import getUser from "@/lib/user";
import Language from "@/lib/language";

export default async function Editorial({
	params: { contest: contest_id, task: id }
}: {
	params: {
		contest: string,
		task: string
	}
}) {

	const task = await getProblem(id);

	if (!task) {

		notFound();

	}

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const isEditor = (await task.editors!!.get()).includes(user.getID()!!);
	const isTester = (await task.testers!!.get()).includes(user.getID()!!);

	return (
		<div className={styles.editorials}>
			<h1>{await task.name!!.get()} <Language>editorial</Language></h1>
			{
				await user.rating!!.get() >= 2000 || isEditor || isTester ?
					<Link href={`/contests/${contest_id}/tasks/${id}/editorial/add`}><Language>add_editorial</Language></Link> :
					<></>
			}
			{
				(() => {
					const d = fs.readdirSync(`./static/editorials/${id}`).map((dir, i) => {

						const data = JSON.parse(fs.readFileSync(`./static/editorials/${id}/${dir}/data.json`, 'utf-8'));

						return (
							<div key={i}>
								<Link href={`/contests/${contest_id}/tasks/${id}/editorial/${dir}`}>{data.name}</Link> by {data.author}
							</div>
						);

					});
					return d.length ? d : <div><Language>no_editorial</Language></div>;
				})()
			}
		</div>
	)

}