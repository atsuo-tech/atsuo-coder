import React from "react";
import styles from "./form.module.css";

export default function Form(
	{
		children,
		action,
		method
	}: {
		children: React.ReactNode,
		action: string,
		method: "get" | "post"
	}) {

	return (

		<div className={styles.body1}>

			<form action="/admin/contests/post/new" method="post" encType="multipart/form-data">

				{children}

			</form>

		</div>

	);

}
