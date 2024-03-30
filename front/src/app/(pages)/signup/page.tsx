import styles from "./signup.module.css"
import { Form } from "./actions";

export default function Signup() {
	
	return (
		<>
			<div className={styles.body1}>
				<h1>Sign up | AtsuoCoder</h1>
				<form action={Form} className={styles.form}>
					<label htmlFor="username">Username</label>
					<br />
					<input name="username" id="username" autoComplete="username" pattern="[0-9a-z]{1-16}" />
					<label htmlFor="password">Password</label>
					<br />
					<input name="password" id="password" type="password" autoComplete="new-password" pattern=".{8-255}" />
					<label htmlFor="grade">Grade</label>
					<br />
					<input name="grade" id="grade" type="number" autoComplete="on" pattern="[0-9]{2,3}" />
					<br />
					<label htmlFor="name">Name</label>
					<br />
					<input name="name1" id="name1" type="text" autoCorrect="off" placeholder="First Name" required />
					<input name="name2" id="name2" type="text" autoCorrect="off" placeholder="Middle Name" />
					<input name="name3" id="name3" type="text" autoCorrect="off" placeholder="Last Name" required />
					<input type="submit" id="submit" value="Submit" autoComplete="off" />
				</form>
			</div>
		</>
	)

}