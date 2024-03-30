import styles from "../form.module.css";
import { notFound } from "next/navigation";
import getUser from "@/lib/user";
import Form from "@/components/form";

export default async function Page({ searchParams }: { searchParams: { error: string } }) {

	const user = await getUser();

	if (!user) {

		notFound();

	}

	const name = await user.name?.get();

	return (
		<>
			<h1>Setting | AtsuoCoder</h1>
			<br />
			{
				searchParams.error == "0" ?
					<div className={styles.success}>
						<p>Updated!</p>
						<br />
					</div> :
					<></>
			}
			{
				searchParams.error == "1" ?
					<div className={styles.error}>
						<p>Error: wrong password!</p>
						<br />
					</div> :
					<></>
			}
			{
				searchParams.error == "2" ?
					<div className={styles.error}>
						<p>Error: password retype miss!</p>
					</div> :
					<></>
			}
			<Form action="/account/post" method="post">
				<input type="hidden" name="type" defaultValue="update" />
				<label htmlFor="grade">Grade</label>
				<br />
				<input name="grade" id="grade" type="number" placeholder="130" required defaultValue={await user.grade?.get()} />
				<br />
				<label htmlFor="name">Name</label>
				<br />
				<input name="name1" id="name1" type="text" autoComplete="on" placeholder="First Name" required defaultValue={name?.[0]} />
				<br />
				<input name="name2" id="name2" type="text" autoComplete="on" placeholder="Middle Name" defaultValue={name?.length == 2 ? "" : name?.[1]} />
				<br />
				<input name="name3" id="name3" type="text" autoComplete="on" placeholder="Last Name" required defaultValue={name?.length == 3 ? name?.[2] : name?.[1] || undefined} />
				<br />
				<input type="submit" defaultValue="Save changes" />
			</Form>
			<br />
			<Form action="/account/post" method="post">
				<input type="hidden" name="type" defaultValue="password" />
				<label htmlFor="current_password">Current Password</label>
				<br />
				<input name="current_password" id="current_password" type="password" autoComplete="current-password" required />
				<br />
				<label htmlFor="new_password">New Password</label>
				<br />
				<input name="new_password" id="new_password" type="password" autoComplete="new-password" required />
				<br />
				<label htmlFor="new_password2">New Password (again)</label>
				<br />
				<input name="new_password2" id="new_password2" type="password" autoComplete="new-password" required />
				<br />
				<input type="submit" defaultValue="Save changes" />
			</Form>
		</>
	)

}