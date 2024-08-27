import next from "next";
import express from "express";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import mysql, { RowDataPacket } from "mysql2/promise";
import Server, { Result } from "./judge/protocol";
import http from "http";
import https from "https";
import getInnerAPI from "./innerAPI";
import cookieParser from "cookie-parser";
config({ path: path.join(__dirname, "./../../.env") });

console.log("Application is running in:", process.env.NODE_ENV);

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

const front = next({ dir: "../front", dev: process.env.NODE_ENV == "development" });

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
	const judgeServer = new Server();

	function loadTestcases(id: string) {

		judgeServer.loadTask(id);

	}

	tasks.forEach((task) => {

		const { id } = task as { id: string };

		loadTestcases(id);

	});

	judgeServer.server.listen(6431, "0.0.0.0");

	const judging: { [key: string]: boolean } = {};

	// judgeServer.addQueue(sql, "test");
	setInterval(() => {

		sql.query<RowDataPacket[]>("SELECT * FROM submissions WHERE judge = 'WJ';").then((datas) => {

			for (const data of datas[0]) {

				if (judging[data.id]) continue;
				judging[data.id] = true;

				judgeServer.addSubmission(data.id, data.task, data.language, data.sourceCode).then((result) => {

					if (!result) {

						sql.query("UPDATE submissions SET judge = '[[8, 0], [], []]' WHERE id = ?;", [data.id]);

					} else if (result.message != "") {

						sql.query("UPDATE submissions SET judge = ? WHERE id = ?;", [JSON.stringify({ status: result.result[0][0], message: result.message }), data.id]);

					} else {

						sql.query("UPDATE submissions SET judge = ? WHERE id = ?;", [JSON.stringify(result.result), data.id]);

					}

					delete judging[data.id];

				});

			}

		});

	}, 100);

	app.use(cookieParser());

	app.use(async (req, res, next) => {
		if (req.path.endsWith("/") && req.path.length > 1) {
			const query = req.url.slice(req.path.length)
			res.redirect(301, req.path.slice(0, -1) + query)
		} else {
			next()
		}
	})

	app.use("/signup", async (req, res, next) => {

		if (process.env.NODE_ENV == "production") {
			const status = await fetch("https://verify.w-pcp.net/verify?token=" + req.cookies.di_token).then((res) => res.status)
			if (status != 200) {
				res.redirect("https://discord.com/oauth2/authorize?client_id=1251095772288778251&response_type=code&redirect_uri=https%3A%2F%2Fverify.w-pcp.net&scope=guilds");
				return;
			}
		}

		next();

	})

	const files = fs.readdirSync(path.join(__dirname, "routes"));

	for (let i = 0; i < files.length; i++) {
		const p = path.parse(files[i]);

		if (p.name.startsWith('@')) continue;

		if (fs.statSync(path.join(__dirname, "./routes", files[i])).isFile()) {

			if (files[i] == 'index.js' || files[i].endsWith('/index.js')) {

				const input = (await import(path.join(__dirname, "./routes", files[i])));

				let func = input.default(sql, judgeServer);

				app.use(path.join("/api", files[i], '../'), (req, res, next) => {

					return func(req, res, next);

				});

				console.log(`Loaded ${path.join(__dirname, "./routes", files[i])} as ${path.join("/", files[i], '../')}`);

			} else {

				const input = (await import(path.join(__dirname, "./routes", files[i])));

				app.use(path.join("/api", files[i].replace(/\.js$/, "")), input.default(sql, judgeServer));

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
