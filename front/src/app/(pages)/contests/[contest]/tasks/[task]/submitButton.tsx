import submitStyle from "./task.module.css";
import React from "react";

export const Submit: React.FC<{ children: React.ReactNode }> = (props: { children: React.ReactNode }) => {
	function submit() {
		const frame = document.querySelector("#ace-editor") as HTMLIFrameElement;
		frame.contentWindow?.postMessage({ type: "get" }, "*");
	}
	return <button id="submit-button" className={submitStyle['submit-button']} onClick={submit}>提出</button>;
}

export default Submit;
