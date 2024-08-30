import styles from "./signup.module.css"
import { Form } from "./actions";
import Language from "@/lib/languages";

export default async function Signup() {
	
	return (
		<>
			<div className={styles.body1}>
				<h1><Language>register</Language> | AtsuoCoder</h1>
				<form action={Form} className={styles.form}>
					<label htmlFor="username"><Language>username</Language></label>
					<br />
					<input name="username" id="username" autoComplete="username" pattern="[0-9a-z]{1-16}" />
					<br />
					<label htmlFor="password"><Language>password</Language></label>
					<br />
					<input name="password" id="password" type="password" autoComplete="new-password" pattern=".{8-255}" />
					<br />
					<label htmlFor="grade"><Language>grade</Language></label>
					<br />
					<input name="grade" id="grade" type="number" autoComplete="on" pattern="[0-9]{2,3}" />
					<br />
					<label htmlFor="name"><Language>name</Language></label>
					<br />
					<input name="name1" id="name1" type="text" autoCorrect="off" placeholder={await Language({ children: "first_name" })} required />
					<br />
					<input name="name2" id="name2" type="text" autoCorrect="off" placeholder={await Language({ children: "middle_name" }) + await Language({ children: "optional" })} />
					<br />
					<input name="name3" id="name3" type="text" autoCorrect="off" placeholder={await Language({ children: "last_name" })} required />
					<br />
					<input type="submit" id="submit" value={await Language({ children: "register" })} autoComplete="off" />
				</form>
			</div>
		</>
	)

}