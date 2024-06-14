import next from "next";
import express from "express";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import mysql, { RowDataPacket } from "mysql2/promise";
import JudgeServer from "./judge/judge";
import http from "http";
import https from "https";
import getInnerAPI from "./innerAPI";
import cookieParser from "cookie-parser";
config({ path: path.join(__dirname, "./../../.env") });

async function sendDiscord(value: string) {

	if ("discord_webhook_url" in process.env) {

		return new Promise<void>((resolve) => {

			const post = https.request(process.env.discord_webhook_url as string, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				}
			}, (res) => {

				res.on("data", (res) => console.log(res.toString()));
				resolve();

			});

			post.write(value);

			post.end();

		});

	}

}

const front = next({ dir: "../front", dev: process.argv.indexOf("--dev") != -1 });

front.prepare().then(async () => {

	const app = express();
	const frontHandler = front.getRequestHandler();
	const sql = await mysql.createConnection({
		user: "atsuo_judge",
		database: "atsuo_judge",
		password: process.env.db_password,
		stringifyObjects: true,
	});

	const tasks = (await sql.query("SELECT id, judge_type FROM tasks;"))[0] as RowDataPacket[];
	const judgeServer = new JudgeServer({});

	function loadTestcases(id: string) {

		const testcaseDirs = fs.readdirSync(path.join("./static/testcases", id));

		judgeServer.problems[id] = { testcases: [], options: {} };

		testcaseDirs.forEach(testcase => {

			const tests = fs.readdirSync(path.join("./static/testcases", id, testcase));

			const dependencies = JSON.parse(fs.readFileSync(path.join("./static/testcases", id, testcase, "dependencies.json"), 'utf-8'));

			judgeServer.problems[id].testcases.push({ id: testcase, tests: [], dependencies });

			tests.forEach(test => {

				if (!fs.statSync(path.join("./static/testcases", id, testcase, test)).isDirectory()) return;

				const { type, score, outcheck, interactive } = JSON.parse(fs.readFileSync(path.join("./static/testcases", id, testcase, test, "config.json"), 'utf-8'));

				if (type == "plane") {

					judgeServer.problems[id].testcases[judgeServer.problems[id].testcases.length - 1].tests.push({ id: test, input: path.join("./static/testcases", id, testcase, test, "in.txt"), output: path.join("./static/testcases", id, testcase, test, "out.txt"), score });

				} else if (type == "outcheck") {

					judgeServer.problems[id].testcases[judgeServer.problems[id].testcases.length - 1].tests.push({ id: test, input: path.join("./static/testcases", id, testcase, test, "in.txt"), check: path.join("./static/testcases", id, testcase, test, outcheck), score });

				} else if (type == "interactive") {

					judgeServer.problems[id].testcases[judgeServer.problems[id].testcases.length - 1].tests.push({ id: test, interactive: path.join("./static/testcases", id, testcase, test, interactive) });

				}

			});

		});
	}

	tasks.forEach((task) => {

		const { id } = task as { id: string };

		loadTestcases(id);

	});

	sql.query<RowDataPacket[]>("SELECT * FROM submissions WHERE judge = 'WJ';").then((data) => {

		data[0].forEach((submission) => {

			const { id, task } = submission as { id: string, task: string };

			judgeServer.addQueue(sql, id);

		});

	});

	// judgeServer.addQueue(sql, "test");
	setInterval(() => {

		judgeServer.updateQueue(sql);

		sql.query<RowDataPacket[]>("SELECT * FROM submissions WHERE judge = 'WJ';").then((datas) => {

			for (const data of datas[0]) {

				if (!(data.id in judgeServer.judging) && judgeServer.queue.indexOf(data.id) == -1) {

					judgeServer.addQueue(sql, data.id);

				}

			}

		});

	}, 100);

	app.use(cookieParser());

	app.use(async (req, res, next) => {
		const status = await fetch("https://verify.w-pcp.net/verify?token=" + req.cookies.di_token).then((res) => res.status)
		if (status != 200) {
			res.redirect("https://discord.com/oauth2/authorize?client_id=1251095772288778251&response_type=code&redirect_uri=https%3A%2F%2Fverify.w-pcp.net&scope=guilds");
			return;
		}
		if (req.path.endsWith("/") && req.path.length > 1) {
			const query = req.url.slice(req.path.length)
			res.redirect(301, req.path.slice(0, -1) + query)
		} else {
			next()
		}
	})

	const files = fs.readdirSync(path.join(__dirname, "routes"));

	for (let i = 0; i < files.length; i++) {
		const p = path.parse(files[i]);
		if (p.name.startsWith('@')) continue;
		if (fs.statSync(path.join(__dirname, "./routes", files[i])).isFile()) {
			if (files[i] == 'index.js' || files[i].endsWith('/index.js')) {
				const input = (await import(path.join(__dirname, "./routes", files[i])));
				app.use(path.join("/", files[i], '../'), input.default(sql, judgeServer));
				console.log(`Loaded ${path.join(__dirname, "./routes", files[i])} as ${path.join("/", files[i], '../')}`);
			} else {
				const input = (await import(path.join(__dirname, "./routes", files[i])));
				app.use(path.join("/", files[i].replace(/\.js$/, "")), input.default(sql, judgeServer));
				console.log(`Loaded ${path.join(__dirname, "./routes", files[i])} as ${path.join("/", files[i].replace(/\.js$/, ""))}`);
			}
		} else {
			files.push(...fs.readdirSync(path.join(__dirname, "./routes", files[i])).map((file) => path.join(files[i], file)));
		}
	}

	console.log("All files loaded");

	await sendDiscord(JSON.stringify({
		embeds: [
			{
				title: "Server started",
				description: `Server started at ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}`,
				color: 65280
			},
			{
				type: "link",
				title: "AtsuoCoder",
				description: "The PCP official judge server \"AtsuoCoder\" is now available.",
				url: "https://judge.w-pcp.net"
			}
		]
	}));

	process.on("SIGINT", async () => {

		console.log("Server get SIGINT");

		await sendDiscord(JSON.stringify({
			embeds: [
				{
					title: "Server stopped",
					description: `Server stopped at ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} due to SIGINT`,
					color: 16711680
				},
				{
					type: "link",
					title: "AtsuoCoder",
					description: "The PCP official judge server \"AtsuoCoder\" is now unavailable.",
					url: "https://judge.w-pcp.net"
				}
			]
		}));

		process.exit(2);

	});

	process.on("beforeExit", async (code) => {

		if (code == 2) return;

		await sendDiscord(JSON.stringify({
			embeds: [
				{
					title: "Server stopped",
					description: `Server stopped at ${new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} due to unexpected error`,
					color: 16711680
				},
				{
					type: "link",
					title: "AtsuoCoder",
					description: "The PCP official judge server \"AtsuoCoder\" is now unavailable.",
					url: "https://judge.w-pcp.net"
				}
			]
		}));

	});

	app.all("*", (req, res) => frontHandler(req, res));

	(await getInnerAPI(judgeServer, loadTestcases)).listen(9834, "localhost");

	const portRequest = await fetch("http://localhost:8290/add", {
		body: JSON.stringify({
			host: "judge.w-pcp.net"
		}),
		headers: {
			"Content-Type": "application/json"
		},
		method: "POST",
	}).then((res) => res.json()).catch(() => { port: process.env.port });
	console.log(portRequest);
	http.createServer({}, app).listen(process.env.port ? Number(process.env.port) : portRequest.port, process.env.domain)
});

type Router = ((sql: mysql.Connection) => express.Router);

export default Router;
