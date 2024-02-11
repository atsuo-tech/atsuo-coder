"use client";

import { useEffect, useRef } from 'react';
import AceEditor from 'react-ace';

import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/snippets/c_cpp";
import "ace-builds/src-noconflict/ext-beautify";
import "ace-builds/src-noconflict/ext-modelist";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import { Ace } from 'ace-builds';

export default function Home(params: { searchParams: { [key: string]: string } }) {

	const editorRef = useRef<AceEditor>(null);

	useEffect(() => {

		if ("once" in global) return;
		(global as any).once = true;

	});

	function onLoad(editor: Ace.Editor) {

		if (params.searchParams.sourceCode) {
			editor.setValue(params.searchParams.sourceCode);
		}

		if (params.searchParams.readonly) {
			editor.setReadOnly(true);
			console.debug("Readonly mode");
		}

		editor.setOptions({
			autoScrollEditorIntoView: true,
			copyWithEmptySelection: true,
		});
		editor.setFontSize(16);

		window.addEventListener("message", (data) => {
			if (data.data.type == "get") {
				window.parent.postMessage({ res: "get", value: editor.getValue() });
			} else if (data.data.type == "set") {
				editor.setValue(data.data.value);
				window.parent.postMessage({ res: "set" });
			}
		})

	}

	return (<AceEditor
		ref={editorRef}
		mode="c_cpp"
		theme="monokai"
		width='100%'
		height='30em'
		onLoad={onLoad}
	></AceEditor>)

}