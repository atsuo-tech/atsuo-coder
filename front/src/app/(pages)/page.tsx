import styles from './page.module.css'
import homeStyles from './home.module.css'

export default function Home() {
	return (
		<>
			<div className={homeStyles.image}>
				<div className={homeStyles['image-effect']}></div>
				<h1 className={homeStyles['image-text']}>Atsuo Coder</h1></div>

			<h2 className={homeStyles.information}>Information</h2>

			<div className={styles.grid}>
			</div>
		</>
	)
}
