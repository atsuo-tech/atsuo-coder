import Form from "@/components/form";

export default async function Rating() {

	return (
		<>
			<h1>Rating | Atsuo Coder</h1>
			<br />
			<Form action="/admin/ratings/post" method="post">

				<label htmlFor="id">Contest ID</label>
				<br />
				<input type="text" name="id" id="id" placeholder="Contest ID" required />

				<br />

				<label htmlFor="rated">Rated</label>
				<br />
				<select id="rated" name="rated">
					<option id="rated">Rated</option>
					<option id="unrated">Unrated</option>
				</select>

				<br />

				<input type="submit" value="Submit" />

			</Form>
		</>
	)

}