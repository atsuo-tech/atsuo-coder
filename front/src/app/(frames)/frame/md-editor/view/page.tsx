import markdownHtml from 'zenn-markdown-html';
import 'zenn-content-css';

export default function Home(props: { searchParams: { html: string } }) {

	const html = markdownHtml(props.searchParams.html);

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
