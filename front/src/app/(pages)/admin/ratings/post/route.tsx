import { NextRequest } from "next/server";
import { hasAdminPremission } from "../../permission";
import { notFound } from "next/navigation";
import { Contest, User } from "@w-yama-can/rating-system";
import { sql } from "@/app/sql";
import { FieldPacket, RowDataPacket } from "mysql2";
import getContest from "@/lib/contest";

export async function POST(req: NextRequest) {

	if (!hasAdminPremission()) {

		notFound();

	}

	const data = await req.formData();

	const contestId = data.get("id") as string;
	const rated = data.get("rated");

	if (!contestId || !rated) {

		return new Response("Bad Request", {
			status: 400
		});

	}

	if (rated == "Rated") {

		const [submissions, _] = await sql.query("SELECT * FROM submissions WHERE contest = ? ORDER BY created_at", [contestId]) as [{ id: string, sourceCode: string, contest: string, task: string, user: string, created_at: Date, judge: string, language: string }[], FieldPacket[]];

		const scores: { [user: string]: { score: number, problems: { [problem: string]: { score: number, penalty: number, notEffectedPenalty: number, lastSubmitTime: number } } } } = {};

		const contest = (await getContest(contestId))!!;

		for (let i = 0; i < submissions.length; i++) {

			if (submissions[i].judge == "WJ" || JSON.parse(submissions[i].judge).status == 3) continue;
			scores[submissions[i].user] = scores[submissions[i].user] || { score: 0, problems: {} };

			if (!scores[submissions[i].user].problems[submissions[i].task]) {

				scores[submissions[i].user].problems[submissions[i].task] = { lastSubmitTime: 0, notEffectedPenalty: 0, penalty: 0, score: 0 };

			}

			if (scores[submissions[i].user].problems[submissions[i].task].score < JSON.parse(submissions[i].judge)[0][1]) {

				scores[submissions[i].user].problems[submissions[i].task].penalty += scores[submissions[i].user].problems[submissions[i].task].notEffectedPenalty || 0;
				scores[submissions[i].user].problems[submissions[i].task].lastSubmitTime = submissions[i].created_at.getTime() - (await contest.start!!.get()).getTime();
				scores[submissions[i].user].problems[submissions[i].task].score = JSON.parse(submissions[i].judge)[0][1];
				scores[submissions[i].user].problems[submissions[i].task].notEffectedPenalty = 1;

			} else {

				scores[submissions[i].user].problems[submissions[i].task].notEffectedPenalty = (scores[submissions[i].user].problems[submissions[i].task].notEffectedPenalty || 0) + 1;

			}

		}

		let users: { user: string, score: number, contestTime: number }[] = [];

		for (const user in scores) {

			let lastSubmitTime = 0;
			let penalty = 0;

			for (const problem in scores[user].problems) {

				scores[user].score += scores[user].problems[problem].score;
				penalty += scores[user].problems[problem].penalty;
				lastSubmitTime = Math.max(lastSubmitTime, scores[user].problems[problem].lastSubmitTime);

			}

			users.push({ user, score: scores[user].score, contestTime: lastSubmitTime + (await contest.penalty!!.get()) * penalty });

		}

		const rated_users = await contest.rated_users!!.get();
		const unrated_users = await contest.unrated_users!!.get();

		const registerd_users = rated_users.concat(unrated_users);

		users = users.filter((user) => registerd_users.includes(user.user));

		registerd_users.filter((user) => !users.find((value) => value.user == user)).map((user) => {

			users.push({ user, score: 0, contestTime: 0 });

		});

		users.sort((a, b) => (b.score - a.score == 0 ? a.contestTime - b.contestTime : b.score - a.score));

		const dContest = new Contest();

		const [userInfo] = await sql.query<RowDataPacket[]>("SELECT * from users where id in (?)", [users.map((v) => v.user)]);

		const dUsers: { [user: string]: User } = {};
		const performances: { [user: string]: number } = {};

		users.forEach((user, index) => {

			const performance = Array.from<any>(JSON.parse(userInfo.find((v) => v.id == user.user)!!.performances)).map((val) => val.performance);
			dUsers[user.user] = new User(user.user, userInfo.find((v) => v.id == user.user)!!.inner_rating, performance);
			dContest.addUser(dUsers[user.user]);

		});

		users.forEach((user, index) => {

			const dUser = dUsers[user.user];

			const perf = dUser.calcPerformance(dContest, index + 1, Infinity);

			performances[user.user] = perf;

			console.log(user.user, perf, userInfo.find((v) => v.id == user.user)!!.inner_rating);

		});

		for (const user of users) {

			const dUser = dUsers[user.user];

			const rating = dUser.calcRating();
			const innerRating = dUser.calcInnerRating();

			console.log(user.user, rating, innerRating);

			await sql.query("UPDATE users SET rating = ?, inner_rating = ?, performances = ? WHERE id = ?", [rating, innerRating, JSON.stringify([...JSON.parse(userInfo.find((v) => v.id == user.user)!!.performances), { performance: performances[user.user], contest: contestId }]), user.user]);

		}

		return Response.redirect("/admin/ratings");

	}

}
