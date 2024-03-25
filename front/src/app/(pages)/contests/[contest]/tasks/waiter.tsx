"use client";

import { useEffect } from "react";

export default function Waiter({ start }: { start: Date }) {

	useEffect(() => {

		setInterval(() => {

			const under = new Date(start.getTime() - Date.now());

			document.querySelector("#under")!!.textContent = `${under.getUTCDate() - 1}日 ${under.getUTCHours()}時間 ${under.getUTCMinutes()}分 ${under.getUTCSeconds()}秒`;

			if (start.getTime() - Date.now() <= 0) {

				location.reload();

			}

		}, 15);

	});

	return (
		<>

			<p id="under"></p>

		</>
	)

}
