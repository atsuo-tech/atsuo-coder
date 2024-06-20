import './globals.css'
import styles from './page.module.css'
import headerStyles from "./header.module.css"
import type { Metadata } from 'next'
import React from 'react';
import { Permissions } from '@/lib/user'
import getUser from '@/lib/user'
import { SiteHeader, SecondHeader, Header1Button, Header2Button, HeaderUserName, HeaderUserButton, ThirdHeader, Header3Button, FourthHeader, ContestTitle } from '../../components/styled-components';
import Language from '@/lib/language';

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
			<head>
				<link rel="icon" href="/logo.png" />
				<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
			</head>
			<body>
				<div className={headerStyles.headers}>
					<SiteHeader>
						<img src="/AtsuoCoder_logo_2.svg" width={200} height={200}></img>
						<div>
							{
								!user ?
									<>
										<Header1Button><a href="/login"><Language>login</Language></a></Header1Button>
										<Header1Button signup><a href="/signup"><Language>register</Language></a></Header1Button></> :
									<>

										<HeaderUserName><a href={`/users/${user.getID()}`}>
											<img src="/AtsuoCoder_logo.svg" alt="UserIcon" width={48} height={48}></img>
											<p>{user.getID()}</p>
										</a></HeaderUserName>
										{Permissions.hasPermission(permission!!, Permissions.BasePermissions.Admin) ? <HeaderUserButton><a href="/admin">
											<span className="material-icons">manage_accounts</span>
											<br />
											<p><Language>admin</Language></p>
										</a></HeaderUserButton> : <></>}
										<HeaderUserButton><a href="/account/settings">
											<span className="material-icons">settings</span>
											<br />
											<p><Language>settings</Language></p>
										</a></HeaderUserButton>
										<HeaderUserButton logout><a href="/logout">
											<span className="material-icons">logout</span>
											<br />
											<p><Language>logout</Language></p>
										</a></HeaderUserButton>
									</>
							}
						</div>
					</SiteHeader>
					<SecondHeader>
						<Header2Button><a href="/"><Language>home</Language></a></Header2Button>
						<Header2Button><a href="/contests"><Language>contests</Language></a></Header2Button>
						<Header2Button><a href="/ranking"><Language>ranking</Language></a></Header2Button>
					</SecondHeader>
				</div>

				<main className={`${styles.main} main`}>
					{children}
				</main>
			</body>
		</html>
	);
}
