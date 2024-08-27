"use server";

import { execSync } from "child_process";

export default async function Restart() {

	setTimeout(() => {

		execSync("pm2 restart all");

	}, 1000);

	return (
		<>

			<h1>Restarting Server</h1>

			<p>PM2 が使用されているときのみ再起動されます。</p>

		</>
	)

}