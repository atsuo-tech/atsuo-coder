export default async function Page() {

	const value = await (await fetch("http://localhost:9834/judge/queue")).json();

	return (
		<>

			<h1>Systems | AtsuoCoder Admin</h1>

			<button><a href="/admin/systems/restart">Restart Server</a></button>

			<table>

				<thead>

					<tr>

						<th>Max</th>
						<th>Judging</th>
						<th>Queue</th>

					</tr>

				</thead>

				<tbody>

					<tr>

						<td>{value.maxJudge}</td>
						<td>{value.judgingCount}</td>
						<td>{JSON.stringify(value.queue)}</td>

					</tr>

				</tbody>

			</table>

		</>
	)

}
