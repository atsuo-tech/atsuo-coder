import express from "express";
import Server from "src/judge/protocol";

export default async function getInnerAPI(judgeServer: Server, loadTestcases: (id: string) => void) {

	const innerAPI = express();

	innerAPI.use(express.json());

	innerAPI.get("/testcases/:task/reload", (req, res) => {

		judgeServer.loadTask(req.params.task);

	});

	return innerAPI;

}
