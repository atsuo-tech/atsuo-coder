import { Form } from "./actions";
import getUser from "@/lib/user";

export interface Contest {

	id: string;
	name: string;
	problems: string[];

	public: boolean;

	editor: string[];
	tester: string[];

	rated: string;

	start: number;
	period: number;

}

export default async function Page() {

	const user = await getUser();

	if (user) {

		return (
			<>
				<h1>Login | Atsuo Coder</h1>
				<p>You are already logged in as <code>{user.getID()}</code>.</p>

				<ul>
					<li><b>Links</b></li>
					<li><a href="/logout">Logout</a></li>
					<li><a href="/">Back to home</a></li>
					<li><a href="/account/settings">Account settings</a></li>
				</ul>
			</>
		);

	}

	return (
		<>
			<h1>Login | Atsuo Coder</h1>

			<form action={Form}>
				<input type="text" name="id" placeholder="ID" required /><br />
				<input type="password" name="password" placeholder="Password" required /><br />
				<input type="submit" value="Login" />
			</form>
		</>
	);

}
