"use client";

import style from "./page.module.css";

export function AceEditor({ children: sourceCode, readonly }: { children: string, readonly: boolean }) {

	const uuid = crypto.randomUUID();

	return <iframe src={`/frame/ace-editor?readonly=${readonly ? "true" : "false"}`} id={uuid} className={style.reader} onLoad={(iframe) => iframe.currentTarget.contentWindow!!.postMessage({ type: "set", value: sourceCode }, "*")}></iframe>;

}
