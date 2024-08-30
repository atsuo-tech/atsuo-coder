import Language from "@/lib/languages";
import { Form } from "./actions";
import getUser from "@/lib/user";

export interface Contest {

	id: string;
	name: string;
	problems: string[];

	public: boolean;

	editors: string[];
	testers: string[];

	rated: string;

	start: number;
	period: number;

}

export default async function Page() {

	const user = await getUser();

	if (user) {

		return (
			<>
				<h1><Language>login</Language> | Atsuo Coder</h1>
				<p>You are already logged in as <code>{user.getID()}</code>.</p>

				<ul>
					<li><b><Language>links</Language></b></li>
					<li><a href="/logout"><Language>logout</Language></a></li>
					<li><a href="/"><Language>home</Language></a></li>
					<li><a href="/account/settings"><Language>settings</Language></a></li>
				</ul>
			</>
		);

	}

	return (
		<>
			<h1><Language>login</Language> | Atsuo Coder</h1>

			<form action={Form}>
				<input type="text" name="id" placeholder={await Language({ children: "id" })} required /><br />
				<input type="password" name="password" placeholder={await Language({ children: "password" })} required /><br />
				<input type="submit" value={await Language({ children: "login" })} />
			</form>
		</>
	);

}
