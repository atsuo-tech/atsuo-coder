import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import React from "react";
import './mathjax.css';

export const Mathjax: React.FC<{ children: React.ReactNode }> = (props: { children: React.ReactNode }) => {
	const element = props.children as React.ReactElement;

	if (typeof element == "string" || typeof element == "number" || typeof element == "undefined") {
		const cpos = `${element}`.replace(/\r/, "\n").replace(/\n+/, "\n").split("\n");
		let res = <></>;
		cpos.forEach((line) => {
			const matches = line.matchAll(/\$\$(.*?)\$\$/g);
			let pos = 0;
			let itr = matches.next();
			while (!itr.done) {
				res = <>{res}{line.substring(pos, itr.value.index)}<InlineMath>{itr.value[1]}</InlineMath></>;
				pos = itr.value.index!! + itr.value[0].length;
				itr = matches.next();
			}
			res = <>{res}{line.substring(pos, line.length)}<br /></>;
		});

		return res;
	}

	const res = (typeof element.props.children == "string" ? Mathjax(element.props) : Array.from(element.props.children as React.ReactNode[]).map((v, i) => {
		return Mathjax({ children: v });
	}));

	return <>{React.createElement(element.type, {}, res)}</>;
}

export default Mathjax;
