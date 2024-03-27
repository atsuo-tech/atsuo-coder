import './globals.css'
import styles from './page.module.css'
import headerStyles from "./header.module.css"
import type { Metadata } from 'next'
import React from 'react';
import { Permissions } from '@/lib/user'
import getUser from '@/lib/user'

export const metadata: Metadata = {
	title: 'Atsuo Coder',
	description: 'Judge System for W-PCP',
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {

	const user = await getUser();

	const permission = await user?.permission?.get();

	return (
		<html lang="ja">
			<link rel="icon" href="/logo.png" />

			<body>
				<div className={headerStyles.headers}>
					<header className={headerStyles.title}>
						<ul className={headerStyles.head}>
							<h2 className={headerStyles.titleText}>AtsuoCoder</h2>
							<ul className={headerStyles.login}>
								{
									!user ?
										<><li><a href="/login">Login</a></li>
											<li className={headerStyles.signup}><a href="/signup">Sign Up</a></li></> :
										<>
											{Permissions.hasPermission(permission!!, Permissions.BasePermissions.Admin) ? <li><a href="/admin">Admin</a></li> : <></>}
											<li><a href="/account/settings">Account Settings</a></li>
											<li><a href="/logout" className={headerStyles.signup}>Logout</a></li>
										</>
								}
							</ul>
						</ul>
					</header>
					<ul className={headerStyles.menu}>
						<li><a href="/">Home</a></li>
						<li><a href="/contests">Contests</a></li>
						<li><a href="/ranking">Ranking</a></li>
					</ul>
				</div>

				<main className={`${styles.main} main`}>
					<div className={styles.center}></div>
					{children}
				</main>
			</body>
		</html>
	);
}
