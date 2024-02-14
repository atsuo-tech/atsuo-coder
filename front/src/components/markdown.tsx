import markdownHtml from 'zenn-markdown-html';
import 'zenn-content-css';
import './updater.css';
import Head from 'next/head';

export default function Markdown({ md }: { md: string }) {

	const html = markdownHtml(md);

	return (
		<>
			<Head>
				<script src="https://embed.zenn.studio/js/listen-embed-event.js" async></script>
			</Head>
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
