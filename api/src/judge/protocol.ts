import tls from "tls";
import fs from "fs";
import crypto from "crypto";
import path from "path";

export enum Result {
	AC = 0,
	WA = 1,
	RE = 2,
	CE = 3,
	TLE = 4,
	OLE = 5,
	MLE = 6,
	QLE = 7,
	IE = 8
}

export interface BaseRequest {
	type: 'simple' | 'outcheck' | 'interactive';
	language: string;
	code: string;
	time_limit: number;
}

export interface SimpleTestcaseRequest extends BaseRequest {
	type: 'simple';
	input: string;
}

export interface OutputCheckTestcaseRequest extends BaseRequest {
	type: 'outcheck';
	input: string;
}

export interface InteractivekTestcaseRequest extends BaseRequest {
	type: 'interactive';
	input: string;
}

export type RequestMethod = SimpleTestcaseRequest | OutputCheckTestcaseRequest | InteractivekTestcaseRequest;

type StatusType = [[Result, number], [Result, number][], [Result, number][][]];

enum SocketStatus {

	BeforeVerify = 0,
	Verifying = 1,
	AfterVerify = 2,
	Cleaning = 3

}

export default class Server {

	constructor() {

		this.server = tls.createServer({
			cert: fs.readFileSync("../certs/cert.pem"),
			key: fs.readFileSync("../certs/key.pem")
		}).on("secureConnection", (socket) => {

			const verify_uuid = crypto.randomUUID();

			let buildFunc: (data: { result: "OK" | "RE" | "TLE" | "IE", message: string }) => void = () => { };
			let testFunc: (result: Result) => void = () => { };

			let nowJudge: { task: string, testcase: string, test: string };

			this.stats[verify_uuid] = {
				queue: [],
				ready: false,
				judging: false,
				request: async (task: string, code: string) => {

					return new Promise<{ result: StatusType, message: string }>(async (resolve) => {

						this.stats[verify_uuid].queue.push(async () => {

							const taskData = this.task[task];

							socket.write("build:" + Buffer.from(JSON.stringify({ language: 'cpp23', code })).toString("base64") + ";");

							const { result: buildResult, message } = await new Promise<{ result: "OK" | "RE" | "TLE" | "IE", message: string }>((resolve) => {

								buildFunc = resolve;

							});

							if (buildResult != "OK") {

								if (buildResult == "RE") {

									resolve({ result: [[Result.CE, 0], [], []], message: "Your build process is killed due to an error occured on compile\n\n" + message });

								} else if (buildResult == "TLE") {

									resolve({ result: [[Result.CE, 0], [], []], message: "Your build process is killed due to time limit exceeded\n\n" + message });

								} else {

									resolve({ result: [[Result.IE, 0], [], []], message: "Your build process is killed due to an internal error\n\n" + message });

								}

							}

							const result: StatusType = [[Result.AC, 0], [], []];

							for (const testcase in taskData) {

								let currentResult: Result = Result.AC;
								let score = 0;

								result[2].push([]);

								for (const test in taskData[testcase]) {

									nowJudge = { task, testcase, test };

									console.log(testcase, test);

									const testData = taskData[testcase][test];

									const waitFunc = new Promise<Result>((resolve) => {

										testFunc = resolve;

									});

									if (testData.type == 'simple') {

										socket.write("request:" + Buffer.from(JSON.stringify({ type: testData.type, time_limit: testData.time_limit, input: fs.readFileSync(testData.input_path, "utf-8") })).toString("base64") + ";");

									} else if (testData.type == 'outcheck') {

										console.error("Not implemented");

									} else if (testData.type == 'interactive') {

										console.error("Not implemented");

									}

									const testResult = await waitFunc;

									result[2][result[2].length - 1].push([testResult, testData.score]);

									result[0][0] = Math.max(result[0][0], testResult);
									currentResult = Math.max(currentResult, testResult);

									score = Math.max(score, testData.score);

								}

								result[1].push([currentResult, currentResult == Result.AC ? score : 0]);
								if (result[1][result[1].length - 1][0] == Result.AC) result[0][1] += score;

							}

							console.log("JUDGE END");
							socket.write("complete;");
							state = SocketStatus.Cleaning;

							resolve({ result, message: "" });

						});

					});

				}
			}

			setInterval(() => {

				if (this.stats[verify_uuid].judging || this.stats[verify_uuid].queue.length == 0) return;
				this.stats[verify_uuid].judging = true;
				this.stats[verify_uuid].queue.shift()?.();

			}, 100);

			let state = SocketStatus.BeforeVerify;

			let remaining: string = "";

			socket.addListener("data", (input: string) => {

				if (!input.includes(";")) {

					remaining += input;
					return;

				}

				const splitPos = input.indexOf(";");

				let newRemaining = input.slice(splitPos + 1);

				input = remaining + input.slice(0, splitPos);
				remaining = newRemaining;

				const args = input.toString().split(";")[0].split(":");

				const method = args[0];
				const data = args.length == 1 ? "" : Buffer.from(args[1], "base64").toString();

				console.table({ method, data });

				if (method == 'helo') {

					if (state != SocketStatus.BeforeVerify) {

						socket.end();
						socket.destroy();
						return;

					}

					socket.write("verify:" + Buffer.from(verify_uuid).toString("base64") + ";");
					state = SocketStatus.Verifying;

				} else if (method == 'verifying') {

					if (state != SocketStatus.Verifying) {

						socket.end();
						socket.destroy();
						return;

					}

					const pub_key = fs.readFileSync("../certs/verified_keys", "utf-8").split("\n").filter(Boolean);

					if (pub_key.includes(data)) {

						socket.write("greets;");
						this.stats[verify_uuid].ready = true;
						state = SocketStatus.AfterVerify;

					} else {

						socket.end();
						socket.destroy();

					}

				} else if (method == 'end') {

					if (state != SocketStatus.AfterVerify) {

						socket.end();
						socket.destroy();
						return;

					}

					const dataJSON = JSON.parse(data);

					if (dataJSON.status != "OK") {

						if (dataJSON.status == "MLE") {

							testFunc(Result.MLE);

						} else if (dataJSON.status == "TLE") {

							testFunc(Result.TLE);

						} else if (dataJSON.status == "QLE") {

							testFunc(Result.QLE);

						} else if (dataJSON.status == "OLE") {

							testFunc(Result.OLE);

						} else if (dataJSON.status == "RE") {

							testFunc(Result.RE);

						} else {

							testFunc(Result.IE);

						}

					}

					const test = this.task[nowJudge.task][nowJudge.testcase][nowJudge.test];

					if (test.type != 'simple') {

						console.error("Invalid test type: ", test.type);

					} else if (test.output == dataJSON.output) {

						testFunc(Result.AC);

					} else {

						testFunc(Result.WA);

					}

				} else if (method == "built") {

					if (state != SocketStatus.AfterVerify) {

						socket.end();
						socket.destroy();
						return;

					}

					const dataJSON = JSON.parse(data);

					buildFunc({ result: dataJSON.result == "OK" ? "OK" : dataJSON.result == "RE" ? "RE" : dataJSON.result == "TLE" ? "TLE" : "IE", message: dataJSON.message });

				} else if (method == "completed") {

					if (state != SocketStatus.Cleaning) {

						socket.end();
						socket.destroy();
						return;

					}

					state = SocketStatus.AfterVerify;
					this.stats[verify_uuid].judging = false;

				}

			})

		});

	}

	loadTask(id: string) {

		const normalize = (str: string) => str.replace(/[\r\n]+/g, " ").replace(/[\s]+/g, " ").replace(/^\s/, "").replace(/\s$/, "");

		const dir = fs.readdirSync(path.join(__dirname, "../../static/testcases", id));

		this.task[id] = {};

		for (const testcase of dir) {

			this.task[id][testcase] = {};

			const testcase_dir = fs.readdirSync(path.join(__dirname, "../../static/testcases", id, testcase));

			for (const test of testcase_dir) {

				if (!fs.statSync(path.join(__dirname, "../../static/testcases", id, testcase, test)).isDirectory()) continue;

				const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../../static/testcases", id, testcase, test, "config.json"), "utf-8"));

				if (!('version' in config) || config.version == "0.0") {

					if (config.type == 'plane') {

						console.log("Loaded testcase: ", id, testcase, test);

						const hash = crypto.createHash('sha512');
						hash.update(normalize(fs.readFileSync(path.join(__dirname, "../../static/testcases", id, testcase, test, "out.txt"), "utf-8")));

						this.task[id][testcase][test] = {
							type: 'simple',
							input_path: path.join(__dirname, "../../static/testcases", id, testcase, test, "in.txt"),
							output: hash.digest('hex'),
							score: config.score,
							time_limit: 2000
						}

					} else {

						console.error("Invalid config.json type: ", config.type);

					}

				} else {

					console.error("Invalid config.json version: ", config.version);

				}

			}

		}

	}

	public async addSubmission(submissionID: string, task: string, code: string) {

		const sums: [number, string][] = [];

		for (const uuid in this.stats) {

			if (this.stats[uuid].ready) {

				sums.push([this.stats[uuid].queue.length, uuid]);

			}

		}

		sums.sort((a, b) => a[0] - b[0]);

		console.log(sums);

		for (const [_, client] of sums) {

			if (this.stats[client].ready) return await this.stats[client].request(task, code);

		}

		return false;

	}

	server: tls.Server;
	submissionID: { [uuid: string]: { id: string, task: string, testcase: string, test: string, type: 'simple' | 'outcheck' | 'interactive' } } = {};
	resolveFunction: { [submission: string]: { [testcase: string]: { [test: string]: (result: Result) => void } } } = {};
	stats: { [verify_uuid: string]: { queue: (() => void)[], request: (task: string, code: string) => Promise<{ result: StatusType, message: string }>, ready: boolean, judging: boolean } } = {};

	task: {
		[key: string]:
		{
			[testcase: string]: {
				[test: string]: { type: 'simple', input_path: string, output: string, score: number, time_limit: number }
				| { type: 'outcheck', input_path: string, output_exec: string, score: number, time_limit: number }
				| { type: 'interactive', input_exec: string, output_exec: string, score: number, time_limit: number }
			}
		}
	} = {};

}
