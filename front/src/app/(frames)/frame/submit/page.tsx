"use client";

import "./button.css"
import "@/app/(pages)/globals.css"
import { useEffect } from 'react';
import submitStyle from './task.module.css'

export default function Home(params: { searchParams: { [key: string]: string } }) {

	useEffect(() => {
		if ("once" in global) return;
		(global as any).once = true;
		document.querySelector("#submit-button")?.addEventListener("click", () => {
			window.addEventListener("message", (data) => {
				if (data.data.res == "get") {
					const form = document.querySelector("#submit-form") as HTMLFormElement;
					const code = document.querySelector("#code") as HTMLInputElement;
					code.value = data.data.value;
					form.submit();
				}
			});

			const frame = document.querySelector("#ace-editor") as HTMLIFrameElement;
			frame.contentWindow?.postMessage({ type: "get" }, "*");
		});
	});

	return (
		<>
			<iframe src="/frame/ace-editor" id="ace-editor" width="100vw" className={submitStyle.ace}></iframe>
			<input type="button" id="submit-button" className={submitStyle['submit-button']} value="提出" width="100%" />

			<form action={`/submit/${params.searchParams.contest}/${params.searchParams.task}`} method="post" target="_top" id="submit-form" hidden>
				<textarea name="sourceCode" id="code"></textarea>
				<input type="text" name="language" id="language" defaultValue={params.searchParams.language} />
				<input type="hidden" name="ct_token" id="csrf" defaultValue={params.searchParams.csrf} />
			</form>
		</>
	)
}