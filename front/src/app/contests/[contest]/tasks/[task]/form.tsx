"use client";

import Editor, { languages } from "@/components/ace-editor";
import { Ace } from "ace-builds";
import style from "./form.module.scss";

export default function Form({ contest, task }: { contest: string, task: string }) {

	let session: Ace.EditSession | undefined = undefined;

	return (
		<>

			<form
				id="task-form"
				action="/api/submit"
				method="post"
				className={`${style.form}`}
				onSubmit={
					(form) => {

						(form.target as HTMLFormElement).querySelector("input[name=code]")!!.setAttribute("value", session!!.getValue());

					}
				}
			>

				<select
					defaultValue="cpp23"
					id="task-form-language"
					onChange={
						(select) => {

							session!!.setMode(`ace/mode/${languages[(document.querySelector("#task-form-language") as HTMLSelectElement).value]}`);

						}
					}
					name="language"
				>

					<option value="cpp23">C++ 23 (g++)</option>
					<option value="nasm">Assembly x64 (NASM)</option>
					{/* <option value="python2">Python 2</option> */}
					{/* <option value="python3">Python 3</option> */}

				</select>

				<Editor
					language="c_cpp"
					onLoad={
						(editor) => {

							session = editor.session;

						}
					}
				/>

				<input type="hidden" name="code" />
				<input type="hidden" name="contest" value={contest} />
				<input type="hidden" name="task" value={task} />

				<input type="submit" value="提出" />

			</form>

		</>
	);

}
