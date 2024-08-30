import getUser from "@/lib/user";

export default async function User({ children: id }: { children: string }) {

	const color = Math.floor((await getUser(id).then((user) => user!!.rating!!.get())) - 1 / 400)

	return <a href={`/users/${id}`} className={`rating${color}`}>{id}</a>

}
