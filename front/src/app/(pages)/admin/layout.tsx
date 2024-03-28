import "./layout.css";
import styles from "./layout.module.css";
import { notFound } from "next/navigation";
import { hasAdminPremission, hasUserAdminPermission, hasUserApproverPermission } from "./permission";
import getUser from "@/lib/user";

export default async function RootLayout({
	children
}: {
	children: React.ReactNode,
}) {

	const user = await getUser();

	if (!user) {

		notFound();

	}

	return (
		<>
			{children}
			<div className={styles.contest}>
				<div className={styles.tab}>
					<ul>
						<div className="pagenow">
							<a href="/admin">
								<li>
									<span className={styles["material-icons"]}>home</span>
									<br />
									Top
								</li>
							</a>
							<a href="/admin/contests">
								<li>
									<span className={styles["material-icons"]}>format_list_numbered</span>
									<br />
									Contests
								</li>
							</a>
							<a href="/admin/clar">
								<li>
									<span className={styles["material-icons"]}>forum</span>
									<br />
									Clar
								</li>
							</a>
							<a href="/admin/tasks">
								<li>
									<span className={styles["material-icons"]}>task</span>
									<br />
									Tasks
								</li>
							</a>
							<a href="/admin/submissions">
								<li>
									<span className={styles["material-icons"]}>send</span>
									<br />
									Submissions
								</li>
							</a>
							<a href="/admin/testcases">
								<li>
									<span className={styles["material-icons"]}>quiz</span>
									<br />
									Testcases
								</li>
							</a>
							{
								await hasUserAdminPermission() || await hasUserApproverPermission() ?
									<a href="/admin/users">
										<li>
											<span className={styles["material-icons"]}>group</span>
											<br />
											Users
										</li>
									</a> :
									<></>
							}
							{
								await hasAdminPremission() ?
									<a href="/admin/caches">
										<li>
											<span className={styles["material-icons"]}>cached</span>
											<br />
											Caches
										</li>
									</a> :
									<></>
							}
						</div>
					</ul>
				</div>
			</div>
		</>
	);

}