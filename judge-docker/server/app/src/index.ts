import tls from "tls";
import fs from "fs-extra";
import { execSync, spawn } from "child_process";
import { createHash } from "crypto";

(async () => {

	const normalize = (str: string) => str.replace(/[\r\n]+/g, " ").replace(/[\s]+/g, " ").replace(/^\s/, "").replace(/\s$/, "");

	const connection = tls.connect(Number(process.argv[3]), process.argv[2], {
		rejectUnauthorized: false
	});

	connection.on("secureConnect", () => {

		connection.setEncoding("utf-8");

		connection.write("helo;");

	})

	let remaining = "";

	connection.on("data", (input) => {

		if (!input.toString().includes(";")) {

			remaining += input.toString();
			return;

		}

		let newRemaining = input.toString().split(";")[1];

		input = remaining + input.toString().split(";")[0];
		remaining = newRemaining;

		const args = input.toString().split(";")[0].split(":");

		const method = args[0];
		const data = args.length == 1 ? "" : Buffer.from(args[1], "base64").toString();

		console.table({ method, data });

		if (method == 'verify') {

			connection.write("verifying:" + fs.readFileSync("pw.env", "base64") + ";");

		} else if (method == 'build') {

			const json = JSON.parse(data);

			if (json.language == 'cpp23') {

				fs.writeFileSync("/home/judge/Main.cpp", json.code);
				const proc = spawn("sudo g++ -std=c++23 -O2 -o ./a.out ./Main.cpp", { shell: "bash", cwd: "/home/judge" });

				let stderr = "", sent = false;

				proc.stdout.on("data", () => { });
				proc.stderr.on("data", (data) => {
					stderr += data;
				});
				proc.on("exit", (code) => {

					if (sent) return;

					if (code == 0) {

						sent = true;
						connection.write("built:" + Buffer.from(JSON.stringify({ result: "OK", message: stderr })).toString("base64") + ";");

					} else {

						sent = true;
						connection.write("built:" + Buffer.from(JSON.stringify({ result: "RE", message: stderr })).toString("base64") + ";");

					}

				});

				setTimeout(() => {

					if (sent) return;
					sent = true;

					proc.kill();
					connection.write("built:" + Buffer.from(JSON.stringify({ result: "TLE", message: stderr })).toString("base64") + ";");

				}, 30000);

			}

		} else if (method == 'request') {

			const json = JSON.parse(data);

			if (json.type == 'simple') {

				const proc = spawn("sudo -u judge /home/judge/a.out", { shell: "bash" });

				let sent = false;

				let stdout = "";

				proc.stdin.on("finish", () => {

					setTimeout(() => {

						if (sent) return;
						sent = true;

						proc.kill();

						connection.write("end:" + Buffer.from(JSON.stringify({ status: "TLE" })).toString("base64") + ";");

					}, json.time_limit);

				});

				proc.stdout.on("data", (data) => stdout += data);
				proc.stderr.on("data", () => { });
				proc.stdin.write(json.input);
				proc.stdin.end();

				proc.on("exit", (code) => {

					if (sent) return;
					sent = true;

					if (code == 0) {

						connection.write("end:" + Buffer.from(JSON.stringify({ status: "OK", output: createHash("sha512").update(normalize(stdout)).digest("hex") })).toString("base64") + ";");

					} else {

						connection.write("end:" + Buffer.from(JSON.stringify({ status: "RE" })).toString("base64") + ";");

					}

				});

			}

		} else if (method == 'complete') {

			fs.rmdirSync("/home/judge", { recursive: true });
			fs.mkdirSync("/home/judge");
			execSync("sudo chown judge:judge /home/judge", { shell: "bash" });

			connection.write("completed;");

		}

	});

	connection.on("error", console.error);

})();
