import { sql } from "@/app/sql";
import { User, getUsers } from "../contests/[contest]/tasks/@component/users";
import Language from "@/lib/languages";

export default async function Page() {

	const result = (await getUsers(sql)).map((user) => {

		let parse: Partial<User> = user;

		delete parse.password;

		return parse;

	});

	result.sort((a, b) => b.rating!! - a.rating!!);

	return (
		<>
			<h1><Language>ranking</Language> | Atsuo Coder</h1>

			<div>

				<table>
					<thead>
						<tr>
							<td><Language>position</Language></td>
							<td><Language>id</Language></td>
							<td><Language>rating</Language></td>
							<td><Language>name</Language></td>
							<td><Language>grade</Language></td>
						</tr>
					</thead>
					<tbody id="data">
						{
							result.map((user, i) =>
								<tr key={i}>
									<td>{i + 1}</td>
									<td><a href={"/users/" + user.id}>{user.id}</a></td>
									<td className={!user.rating || user.rating == 0 ? undefined : `rating${Math.min(7, Math.floor(user.rating / 400))}`}>{user.rating}</td>
									<td>{user.name?.join(" ")}</td>
									<td>{user.grade}</td>
								</tr>
							)
						}
					</tbody>
				</table>

			</div>

		</>
	)
}
