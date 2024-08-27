"use client";

import AceEditor from "react-ace";
import 'brace/mode/c_cpp';
import 'brace/mode/java';
import 'brace/mode/python';
import 'brace/mode/javascript';
import 'brace/mode/assembly_x86';
import 'brace/theme/chrome';
import React from 'react';
import style from './editor.module.css';
import { Ace } from "ace-builds";

export default function Editor(
	{
		language,
		onLoad,
		readonly,
		value,
	}
		: {
			language: "c_cpp" | "java" | "python" | "javascript" | "assembly_x86",
			onLoad?: ((editor: Ace.Editor) => void) | undefined,
			readonly?: boolean | undefined,
			value?: string | undefined,
		}
) {

	return (
		<AceEditor
			mode={language}
			theme="chrome"
			width="100%"
			className={`ace-editor ${style["ace-editor"]}`}
			onLoad={onLoad}
			value={value}
			readOnly={readonly}
		/>
	)

}
