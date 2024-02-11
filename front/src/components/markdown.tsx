import markdownHtml from 'zenn-markdown-html';
import 'zenn-content-css';
import './updater.css';

export default function Markdown({ md }: { md: string }) {

	const html = markdownHtml(md);

	return (
		<>
			<div
				// "znc"というクラス名を指定する
				className="znc"
				// htmlを渡す
				dangerouslySetInnerHTML={{
					__html: html,
				}}
			/>
		</>
	)
}
