import cookieParser from "cookie-parser";
import { Router } from "express";
import { Connection } from "mysql2/promise";
import { getContest } from "../../component/contests";
import { getUserByToken } from "../../component/users";
import crypto from "crypto";
import express from "express";
import JudgeServer from "../../judge/judge";

const languages = ["cpp23", "cpp20"];

export default function Route(sql: Connection, judgeServer: JudgeServer) {
	const router = Router();
	router.use(cookieParser());
	router.use(express.urlencoded({ extended: false }));
	router.post('*', async (req, res) => {

		if (!req.body.sourceCode || !req.body.language || !req.body.ct_token) {
			res.sendStatus(400);
			res.end();
			return;
		}

		if (languages.indexOf(req.body.language) == -1) {
			res.sendStatus(400);
			res.end();
			return;
		}

		const paths = req.url.split("/").filter(Boolean);
		const user = await getUserByToken(sql, req.cookies.cc, req.cookies.ct);

		if (!user) {
			res.redirect("/login");
			res.end();
			return;
		}

		const contest = await getContest(sql, paths[0], user.id);

		if (contest.length == 0) {
			res.sendStatus(404);
			res.end();
			return;
		}

		if (contest[0].problems.indexOf(paths[1]) == -1) {
			res.sendStatus(404);
			res.end();
			return;
		}

		const tokenCheck = await sql.query("SELECT * FROM ct_token WHERE id = ? AND user_id = ? AND use_to = 'SUBMIT';", [req.body.ct_token, user.id]);

		if (Array.from(tokenCheck[0] as any).length == 0) {
			res.sendStatus(403);
			res.end();
			return;
		}

		await sql.query("DELETE FROM ct_token WHERE id = ?;", [req.body.ct_token]);

		const uuid = crypto.randomUUID();

		await sql.query("INSERT into submissions (id, sourceCode, contest, task, user, created_at, judge, language) VALUES (?, ?, ?, ?, ?, now(), 'WJ', ?);", [uuid, req.body.sourceCode, paths[0], paths[1], user.id, req.body.language]);

		judgeServer.addQueue(sql, uuid).then(() => { });

		res.redirect(`/contests/${paths[0]}/submissions/${uuid}`);

	});

	return router;
}
