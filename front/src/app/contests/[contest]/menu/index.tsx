"use client";

import style from "./style.module.css";

export default function MobileMenu({

	problems,
	standings,
	submissions,
	contestUrl

}: {

	problems: boolean,
	standings: boolean,
	submissions: boolean,
	contestUrl: string

}) {

	function openMenu() {

		const menu = document.querySelector(`.${style.menu}.${style.mobile}`);

		window.scrollTo(0, 0);

		menu?.classList.add(style.open);

	}

	function closeMenu() {

		const menu = document.querySelector(`.${style.menu}.${style.mobile}`);

		menu?.classList.remove(style.open);

	}

	return (
		<>

			<div className={style.mobile}>

				<button id="menuOpen" onClick={openMenu}>

					<span className="material-icons">menu</span>

				</button>

			</div>

			<div className={`${style.menu} ${style.mobile}`}>

				<h2>メニュー</h2>

				<a href={contestUrl}>

					<span className="material-icons">home</span>

					<p>トップ</p>

				</a>

				{
					problems ?

						<a href={`${contestUrl}/tasks`}>

							<span className="material-icons">task</span>

							<p>問題</p>

						</a> :

						<></>

				}

				{
					standings ?

						<a href={`${contestUrl}/standings`}>

							<span className="material-icons">leaderboard</span>

							<p>順位表</p>

						</a> :

						<></>

				}

				{
					submissions ?

						<a href={`${contestUrl}/submissions`}>

							<span className="material-icons">send</span>

							<p>提出</p>

						</a> :

						<></>

				}

				<button id="menuClose" onClick={closeMenu}>

					<span className="material-icons">close</span>

					<p>閉じる</p>

				</button>

			</div>

		</>
	);

}
