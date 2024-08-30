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
			language: (typeof ace_languages)[keyof typeof ace_languages],
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

const ace_languages = {

	"cpp23": "c_cpp",
	"python2": "python",
	"python3": "python",
	"nasm": "assembly_x86",

} as const;

export const languages = ace_languages as { [key: string]: (typeof ace_languages)[keyof typeof ace_languages] };
