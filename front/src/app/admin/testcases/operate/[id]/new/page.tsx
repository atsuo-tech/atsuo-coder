import PostNewTestcase from "./post";

export default async function Page({ params: { id } }: { params: { id: string } }) {

	return await PostNewTestcase(id);

}