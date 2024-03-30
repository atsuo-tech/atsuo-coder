import style from "./page.module.css";

export default function Warning(
	{
		children,
	}: {
		children: React.ReactNode
	}
) {

	return (

		<label className={style.warning}>

			{children}

		</label>

	)

}