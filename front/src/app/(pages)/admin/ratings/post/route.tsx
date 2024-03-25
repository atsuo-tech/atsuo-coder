import { NextRequest } from "next/server";
import { hasAdminPremission } from "../../permission";
import { notFound } from "next/navigation";
import { Contest, User } from "@w-yama-can/rating-system";
import { sql } from "@/app/sql";
import { RowDataPacket } from "mysql2";
import getContest from "@/lib/contest";

export async function POST(req: NextRequest) {

	if (!hasAdminPremission()) {

		notFound();

	}

	const data = await req.formData();

	const contest = data.get("id");
	const rated = data.get("rated");

	if (!contest || !rated) {

		return new Response("Bad Request", {
			status: 400
		});

	}

	if (rated == "Rated") {

		const [submissions] = await sql.query<RowDataPacket[]>("SELECT * FROM submissions WHERE contest = ?", [contest]);

		const rankings_d: { [key: string]: { [problem: string]: { score: number, penalty: number, notCountedPenalty: number, lastSubmitted: Date } } } = {};

		let rankings: { id: string, score: number, penalty: number, lastSubmitted: Date }[] = [];

		for (const { task, user, created_at, judge } of submissions) {

			if (judge.startsWith("[") && judge.endsWith("]")) {

				if (rankings_d[user] == undefined) {

					rankings_d[user] = {};

				}

				if (rankings_d[user][task] == undefined) {

					rankings_d[user][task] = { score: 0, penalty: 0, notCountedPenalty: 0, lastSubmitted: new Date(0) };

				}

				if (judge[0][0] != 0) {

					rankings_d[user][task].notCountedPenalty++;

				}

				if (rankings_d[user][task].score < judge[0][1]) {

					rankings_d[user][task].score = judge[0][1];
					rankings_d[user][task].penalty += rankings_d[user][task].notCountedPenalty;
					rankings_d[user][task].lastSubmitted = created_at;
					rankings_d[user][task].notCountedPenalty = 0;

				} else {

					rankings_d[user][task].notCountedPenalty++;

				}

			} else if (judge != "WJ" && JSON.parse(judge).status != 3) {

				rankings_d[user][task].notCountedPenalty++;

			}

		}

		for (const user in rankings_d) {

			let score = 0, penalty = 0, lastSubmitted = new Date(0);

			for (const task in rankings_d[user]) {

				score += rankings_d[user][task].score;
				penalty += rankings_d[user][task].penalty;
				lastSubmitted = new Date(Math.max(lastSubmitted.getTime(), rankings_d[user][task].lastSubmitted.getTime()));

			}

			rankings.push({ score, penalty, lastSubmitted, id: user });

		}

		const contestData = await getContest(contest as string);
		const
			startTime = (await contestData!!.start!!.get()).getTime(),
			penalty = (await contestData!!.penalty!!.get());

		rankings = rankings.sort((a, b) => (a.score == b.score ? a.lastSubmitted.getTime() - startTime + a.penalty * (60 * 1000 * penalty) - b.lastSubmitted.getTime() + b.penalty * (60 * 1000 * penalty) : b.score - a.score));

		const [[{ rated_users, unrated_users }]] = await sql.query<RowDataPacket[]>("SELECT rated_users, unrated_users FROM contests where id = ?", [contest]);

		const userIDs = [...JSON.parse(rated_users), ...JSON.parse(unrated_users)];

		const [cUsers] = await sql.query<RowDataPacket[]>("SELECT id, rating, performances FROM users WHERE id in ?", [userIDs]);

		const users: { [key: string]: User } = {};

		cUsers.forEach(({ id, rating, performances }) => users[id] = new User(id, rating, JSON.parse(performances)));

		const dContest = new Contest();

		for (const userId in users) {

			const dUser = users[userId];

			dContest.addUser(dUser);

		}

		let i = 1;

		for (const user of rankings) {

			const dUser = users[user.id];

			const perf = dUser.calcPerformance(dContest, i, Infinity);
			const rating = dUser.calcRating();

			await sql.query("UPDATE users SET rating = ?, performances = ? WHERE id = ?", [rating, JSON.stringify([...JSON.parse(cUsers.find((v) => v.id == user)!!.performances), perf]), user.id]);

			i++;

		}

		return Response.redirect("/admin/ratings");

	}

}
