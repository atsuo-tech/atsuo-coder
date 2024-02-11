import style from "./permissions.module.css";

export const PERMISSIONS = {
	ADMIN: 0b00001,
	MAKE_CONTESTS: 0b00010,
	MAKE_PROBLEMS: 0b00100,
	UPDATE_CONTESTS: 0b01000,
	UPDATE_PROBLEMS: 0b10000,
}

export default function Permissions({ permissions }: { permissions: number }) {

	return (
		<div className={style.permissions}>
			<div>
				<input type="checkbox" defaultChecked={Boolean(permissions & PERMISSIONS.ADMIN)} disabled id="admin" />
				<label htmlFor="admin">Admin</label>
			</div>
			<div>
				<input type="checkbox" defaultChecked={Boolean(permissions & PERMISSIONS.MAKE_CONTESTS)} disabled id="make-contests" />
				<label htmlFor="make-contests">Make contests</label>
			</div>
			<div>
				<input type="checkbox" defaultChecked={Boolean(permissions & PERMISSIONS.MAKE_PROBLEMS)} disabled id="make-problems" />
				<label htmlFor="make-problems">Make problems</label>
			</div>
			<div>
				<input type="checkbox" defaultChecked={Boolean(permissions & PERMISSIONS.UPDATE_CONTESTS)} disabled id="update-contests" />
				<label htmlFor="update-contests">Update contests</label>
			</div>
			<div>
				<input type="checkbox" defaultChecked={Boolean(permissions & PERMISSIONS.UPDATE_PROBLEMS)} disabled id="update-problems" />
				<label htmlFor="update-problems">Update problems</label>
			</div>
		</div>
	)

}
