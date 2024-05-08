import { Judge, Result, Testcases } from "@w-yama-can/judge-systems";
import { Connection } from "mysql2/promise";

import { languageData } from "./config";

export default class JudgeServer {

	// ジャッジ待ちの問題ID
	public queue: string[] = [];

	private judging: { [id: string]: Judge } = {};

	public problems: {
		[id: string]: {
			testcases: Testcases, options: {
				timeLimit?: number;
				memoryLimit?: number;
				outputLimit?: number;
			}
		}
	} = {};

	public locked: { [id: string]: boolean } = {};

	constructor(testcases: {
		[id: string]: {
			testcases: Testcases, options: {
				timeLimit?: number;
				memoryLimit?: number;
				outputLimit?: number;
			}
		}
	}) {

		this.problems = testcases;

	}

	public readonly maxJudge = 10;
	public judgingCount = 0;

	public async addQueue(sql: Connection, submissionID: string) {

		this.queue.push(submissionID);

		await this.updateQueue(sql);

	}

	public async updateQueue(sql: Connection) {

		if (this.queue.length > 0 && this.judgingCount < this.maxJudge) {

			this.judgingCount++;

			const submissionID = this.queue[0];
			this.queue.shift();

			const data = await sql.query("SELECT * FROM submissions WHERE id = ?", [submissionID]);

			const [{ task, sourceCode, language }] = data[0] as [{ task: string, sourceCode: string, language: string }];

			if (this.locked[task]) {
				this.judgingCount--;
				this.queue.unshift(submissionID);
				await sql.query("UPDATE submissions SET judge = ? where id = ?;", [JSON.stringify({ status: Result.IE, message: "The task is temporarily locked for update. Please submit again." }), submissionID]);
				return;
			}

			// ジャッジ開始

			this.judging[submissionID] = new Judge({ ...this.problems[task].options, languageID: language, docker: { baseImage: "関係ないらしい" }, extension: languageData[language].extention }, this.problems[task].testcases, sourceCode);

			const result = await this.judging[submissionID].build();

			if (result[0] == Result.CE) {
				await sql.query("UPDATE submissions SET judge = ? where id = ?;", [JSON.stringify({ status: Result.CE, message: result[1] }), submissionID]);
				return;
			}

			const judge = await this.judging[submissionID].judge();

			await this.judging[submissionID].deleteImage();

			// 結果計算
			let sum = 0;
			let response = Result.AC;

			judge[0].forEach(([result, point]) => {
				sum += point;
				response = Math.max(response, result);
			});

			delete this.judging[submissionID];

			this.judgingCount--;

			// DBに保存
			await sql.query("UPDATE submissions SET judge = ? where id = ?;", [JSON.stringify([[response, sum], ...judge]), submissionID]);

			// 次のジャッジを開始
			this.updateQueue(sql).then(() => { });

		}

	}

}
