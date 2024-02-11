import { sql } from "@/app/sql";
import JudgeServer from "./judge";
import fs from "fs";
import path from "path";
import { RowDataPacket } from "mysql2";

let server: null | JudgeServer = null;

export default async function getJudgeServer() {

	if (server) {

		return server;

	}

	const tasks = (await sql.query("SELECT id, judge_type FROM tasks;"))[0] as RowDataPacket[];
	const judgeServer = new JudgeServer({});

	const testcasesDir = path.join(__dirname, "../../../../../static/testcases");

	function loadTestcases(id: string) {

		const testcaseDirs = fs.readdirSync(path.join(testcasesDir, id));

		judgeServer.problems[id] = { testcases: [], options: {} };

		testcaseDirs.forEach(testcase => {

			const tests = fs.readdirSync(path.join(testcasesDir, id, testcase));

			const dependencies = JSON.parse(fs.readFileSync(path.join(testcasesDir, id, testcase, "dependencies.json"), 'utf-8'));

			judgeServer.problems[id].testcases.push({ id: testcase, tests: [], dependencies });

			tests.forEach(test => {

				if (!fs.statSync(path.join(testcasesDir, id, testcase, test)).isDirectory()) return;

				const { type, score, outcheck, interactive } = JSON.parse(fs.readFileSync(path.join(testcasesDir, id, testcase, test, "config.json"), 'utf-8'));

				if (type == "plane") {

					judgeServer.problems[id].testcases[judgeServer.problems[id].testcases.length - 1].tests.push({ id: test, input: path.join(testcasesDir, id, testcase, test, "in.txt"), output: path.join(testcasesDir, id, testcase, test, "out.txt"), score });

				} else if (type == "outcheck") {

					judgeServer.problems[id].testcases[judgeServer.problems[id].testcases.length - 1].tests.push({ id: test, input: path.join(testcasesDir, id, testcase, test, "in.txt"), check: path.join(testcasesDir, id, testcase, test, outcheck), score });

				} else if (type == "interactive") {

					judgeServer.problems[id].testcases[judgeServer.problems[id].testcases.length - 1].tests.push({ id: test, interactive: path.join(testcasesDir, id, testcase, test, interactive) });

				}

			});

		});
	}

	tasks.forEach((task) => {

		const { id } = task as { id: string };

		loadTestcases(id);

	});

	// judgeServer.addQueue(sql, "test");
	setInterval(() => {
		judgeServer.updateQueue(sql);
	}, 1500);

	server = judgeServer

	return server;

}
