import styles from './page.module.css'
import homeStyles from './home.module.css'
import "tailwindcss/tailwind.css";

export default function Home() {

	const kaomoji = [
		":(",
		":D",
		":)",
		":|",
		":/",
		":P",
		":O",
		":3",
		":*",
		":]",
		":[",
		":{",
		":}",
		":<",
		":>",
	]

	return (
		<>
			<p>{kaomoji[Math.floor(Math.random() * kaomoji.length)]}</p>
		</>
	)

}
