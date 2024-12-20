import PostDeleteTestcase from "./post";

export default async function Page({ params: { id, testcase } }: { params: { id: string, testcase: string } }) {

	return await PostDeleteTestcase(id, testcase);

}