import express from "express";
import JudgeServer from "src/judge/judge";

export default async function getInnerAPI(judgeServer: JudgeServer, loadTestcases: (id: string) => void) {

	const innerAPI = express();

	innerAPI.use(express.json());

	innerAPI.get("/testcases/:task/reload", (req, res) => {

		judgeServer.locked[req.params.task] = true;
		judgeServer.problems[req.params.task] = { testcases: [], options: {} };
		loadTestcases(req.params.task);
		delete judgeServer.locked[req.params.task];

	});

	innerAPI.get("/judge/queue", (req, res) => {

		res.setHeader("Cache-Control", "no-store");
		res.json({ maxJudge: judgeServer.maxJudge, judgingCount: judgeServer.judgeCount, queue: judgeServer.queue, submissions: judgeServer.judging });

	});

	return innerAPI;

}
