import { sql } from "@/app/sql";
import { User, getUsers } from "../contests/[contest]/tasks/@component/users";

export default async function Page() {

	const result = (await getUsers(sql)).map((user) => {

		let parse: Partial<User> = user;

		delete parse.password;

		return parse;

	});

	result.sort((a, b) => b.rating!! - a.rating!!);

	return (
		<>
			<h1>Ranking | Atsuo Coder</h1>
			<table>
				<thead>
					<tr>
						<td>Rank</td>
						<td>ID</td>
						<td>Rating</td>
						<td>Name</td>
						<td>Grade</td>
					</tr>
				</thead>
				<tbody id="data">
					{
						result.map((user, i) =>
							<tr key={i}>
								<td>{i + 1}</td>
								<td><a href={"/users/" + user.id}>{user.id}</a></td>
								<td className={!user.rating || user.rating == 0 ? undefined : `rating${Math.max(7, Math.floor(user.rating / 400))}`}>{user.rating}</td>
								<td>{user.name?.join(" ")}</td>
								<td>{user.grade}</td>
							</tr>
						)
					}
				</tbody>
			</table>
		</>
	)
}
