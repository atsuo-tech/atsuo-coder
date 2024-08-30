import data from "./data";

export default async function Language({ children: id }: { children: string }) {

	return data.ja[id] || id;

}