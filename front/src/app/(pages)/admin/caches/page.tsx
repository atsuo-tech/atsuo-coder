"use client";
import { useEffect } from "react";
import style from "./page.module.css";

export default function Caches() {

	useEffect(() => {

		if ("once" in global) return;
		(global as any).once = true;

		document.querySelector(".contests .purge")!!.addEventListener("click", async () => {

			const request = fetch("/admin/caches/post/contests", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					id: (document.querySelector(".contests .contest-id")!! as HTMLInputElement).value
				})
			});

			alert("Purging cache...");

			const response = await request;

			if (response.ok) {

				alert("Cache purged.");

			} else {

				alert("Failed to purge cache.");
				alert("Status: " + response.status);

			}

		});

		document.querySelector(".contests .purge-all")!!.addEventListener("click", async () => {

			const request = fetch("/admin/caches/post/contests/all", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({})
			});

			alert("Purging all cache...");

			const response = await request;

			if (response.ok) {

				alert("All cache purged.");

			} else {

				alert("Failed to purge all cache.");
				alert("Status: " + response.status);

			}

		});

		document.querySelector(".users .purge")!!.addEventListener("click", async () => {

			const request = fetch("/admin/caches/post/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					id: (document.querySelector(".users .user-id")!! as HTMLInputElement).value
				})
			});

			alert("Purging cache...");

			const response = await request;

			if (response.ok) {

				alert("Cache purged.");

			} else {

				alert("Failed to purge cache.");
				alert("Status: " + response.status);

			}

		});

		document.querySelector(".users .purge-all")!!.addEventListener("click", async () => {

			const request = fetch("/admin/caches/post/users/all", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({})
			});

			alert("Purging all cache...");

			const response = await request;

			if (response.ok) {

				alert("All cache purged.");

			} else {

				alert("Failed to purge all cache.");
				alert("Status: " + response.status);

			}

		});

		document.querySelector(".tasks .purge")!!.addEventListener("click", async () => {

			const request = fetch("/admin/caches/post/tasks", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					id: (document.querySelector(".tasks .task-id")!! as HTMLInputElement).value
				})
			});

			alert("Purging cache...");

			const response = await request;

			if (response.ok) {

				alert("Cache purged.");

			} else {

				alert("Failed to purge cache.");
				alert("Status: " + response.status);

			}

		});

	});

	return (
		<>
			<div>

				<h1>Caches</h1>

				<br />

				<input type="button" className={`${style.red} purge-all`} value="Purge All Cache" />

				<br />

				<div className={style.caches}>

					<div className="contests">

						<h2>Contests</h2>

						<br />

						<input type="text" className="contest-id" placeholder="aac001" />
						<input type="button" className={`${style.white} purge`} value="Purge Cache" />

						<br />

						<input type="button" className={`${style.red} purge-all`} value="Purge All Cache" />

					</div>

					<div className="tasks">

						<h2>Tasks</h2>

						<br />

						<input type="text" className="task-id" placeholder="aac001_a" />
						<input type="button" className={`${style.white} purge`} value="Purge Cache" />

					</div>

					<div className="users">

						<h2>Users</h2>

						<br />

						<input type="text" className="user-id" placeholder="yama_can" />
						<input type="button" className={`${style.white} purge`} value="Purge Cache" />

						<br />

						<input type="button" className={`${style.red} purge-all`} value="Purge All Cache" />

					</div>

				</div>

			</div>
		</>
	);

}