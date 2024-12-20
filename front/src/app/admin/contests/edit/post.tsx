import Form from "@/components/form";
import styles from "../form.module.css";
import getContest from "@/lib/contest";
import { notFound } from "next/navigation";
import Warning from "@/components/form/warnings";

export default async function PostEditContest(id: string) {

	const contest = await getContest(id);

	if (!contest) {

		notFound();

	}

	return (
		<>
			<h1>Edit Contest | AtsuoCoder Admin</h1>
			<p>Editing {id}</p>
			<br />
			<Form action="/admin/contests/post/edit" method="post">
				<input type="hidden" name="id" defaultValue={id} />
				<label htmlFor="name">Name</label>
				<br />
				<input name="name" id="name" type="text" autoComplete="on" placeholder="AtsuoCoder Algorithm Contest 001" required defaultValue={await contest.name!!.get()} />
				<br />
				<label htmlFor="id">ID</label>
				<br />
				<input name="id" id="id" type="text" autoComplete="on" placeholder="aac001" required disabled defaultValue={id} />
				<br />
				<label htmlFor="start">Start</label>
				<br />
				<input name="start" id="start" type="datetime-local" required defaultValue={(new Date((await contest.start!!.get()).getTime() + 9 * 60 * 60 * 1000)).toISOString().slice(0, 16)} />
				<br />

				<label htmlFor="public">Public</label>
				<p>&quot;0&quot;: private, &quot;1&quot;: public.</p>
				<input name="public" id="public" type="number" required className={styles.public} placeholder="1" defaultValue={Number(await contest.public?.get())} />

				<br />
				<label htmlFor="period">Period</label>
				<p>If this contest should be permanent contest, set this field &quot;-1&quot;.</p>
				<br />
				<input name="period" id="period" type="boolean" required placeholder="100" defaultValue={(await contest.period!!.get()) / 60 / 1000} />
				<label htmlFor="period">minutes</label>
				<br />
				<label htmlFor="penalty">Penalty</label>
				<br />
				<input name="penalty" id="penalty" type="number" required placeholder="5" defaultValue={await contest.penalty!!.get()} />
				<label htmlFor="penalty">minutes</label>
				<br />
				<label htmlFor="problems">Problems</label>
				<br />
				<input name="problems" id="problems" type="text" required placeholder="aac001_a, aac001_b, aac001_c ... , aac001_f" defaultValue={(await contest.problems!!.get()).join(', ')} />
				<br />
				<Warning>
					注意：無効な問題IDが含まれていても、このフィールドに警告は表示されません。
				</Warning>
				<br />
				<label htmlFor="editors">Editors</label>
				<br />
				<input name="editors" id="editors" type="text" required placeholder="yama_can, abn48" defaultValue={(await contest.editors!!.get()).join(', ')} />
				<br />
				<Warning>
					注意：無効なユーザ名が含まれていても、このフィールドに警告は表示されません。
				</Warning>
				<br />
				<label htmlFor="testers">Testers</label>
				<br />
				<input name="testers" id="testers" type="text" required placeholder="yama_can, abn48" defaultValue={(await contest.testers!!.get()).join(', ')} />
				<br />
				<Warning>
					注意：無効なユーザ名が含まれていても、このフィールドに警告は表示されません。
				</Warning>
				<br />
				<label htmlFor="description">Description</label>
				<br />
				<textarea name="description" id="description" placeholder="This contest is ..." required defaultValue={await contest.description!!.get()} />
				<br />
				<input type="submit" defaultValue="Edit" />
			</Form>
		</>
	);
}
