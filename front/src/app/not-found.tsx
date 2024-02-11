import layout from "./(pages)/layout";

export default async function notFoundPage() {
	return layout({
		children:
			<>
				<h1>404 | Atsuo Coder</h1>
				<p>お探しのページは見つかりませんでした。</p>
			</>
	});
}