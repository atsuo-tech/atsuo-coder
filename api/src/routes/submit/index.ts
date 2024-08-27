import cookieParser from "cookie-parser";
import { Router } from "express";
import { Connection } from "mysql2/promise";
import { getContest } from "../../component/contests";
import { getUserByToken } from "../../component/users";
import crypto from "crypto";
import express from "express";

const languages = ["cpp23", "nasm"];

export default function Route(sql: Connection) {
	const router = Router();
	router.use(cookieParser());
	router.use(express.urlencoded({ extended: false }));
	router.post('*', async (req, res) => {

		if (typeof req.body.code != "string" || typeof req.body.language != "string" || typeof req.body.contest != "string" || typeof req.body.task != "string") {
			res.sendStatus(400);
			res.end();
			return;
		}

		if (languages.indexOf(req.body.language) == -1) {
			res.sendStatus(400);
			res.end();
			return;
		}

		const user = await getUserByToken(sql, req.cookies.cc, req.cookies.ct);

		if (!user) {
			res.redirect("/login");
			res.end();
			return;
		}

		const contest = await getContest(sql, req.body.contest, user.id);

		if (contest.length == 0) {
			res.sendStatus(404);
			res.end();
			return;
		}

		if (contest[0].problems.indexOf(req.body.task) == -1) {
			res.sendStatus(404);
			res.end();
			return;
		}

		const uuid = crypto.randomUUID();

		await sql.query("INSERT into submissions (id, sourceCode, contest, task, user, created_at, judge, language) VALUES (?, ?, ?, ?, ?, now(), 'WJ', ?);", [uuid, req.body.code, req.body.contest, req.body.task, user.id, req.body.language]);

		res.redirect(`/contests/${req.body.contest}/submissions/${uuid}`);

	});

	return router;
}
