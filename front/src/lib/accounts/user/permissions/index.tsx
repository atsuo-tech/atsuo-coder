import { User } from "../types";

namespace Permissions {

	export const PERMISSIONS = {
		ADMIN: 1n << 0n,
		MAKE_CONTESTS: 1n << 1n,
		MAKE_PROBLEMS: 1n << 2n,
		UPDATE_CONTESTS: 1n << 3n,
		UPDATE_PROBLEMS: 1n << 4n,
	}

	export const PERMISSION_NAMES = {
		[PERMISSIONS.ADMIN.toString()]: "ADMIN",
		[PERMISSIONS.MAKE_CONTESTS.toString()]: "MAKE_CONTESTS",
		[PERMISSIONS.MAKE_PROBLEMS.toString()]: "MAKE_PROBLEMS",
		[PERMISSIONS.UPDATE_CONTESTS.toString()]: "UPDATE_CONTESTS",
		[PERMISSIONS.UPDATE_PROBLEMS.toString()]: "UPDATE_PROBLEMS",
	} as {
		[key: string]: "ADMIN" | "MAKE_CONTESTS" | "MAKE_PROBLEMS" | "UPDATE_CONTESTS" | "UPDATE_PROBLEMS";
	}

	export const CHILD_PERMISSIONS = {
		ADMIN: [PERMISSIONS.UPDATE_CONTESTS, PERMISSIONS.UPDATE_PROBLEMS],
		MAKE_CONTESTS: [],
		MAKE_PROBLEMS: [],
		UPDATE_CONTESTS: [PERMISSIONS.MAKE_CONTESTS],
		UPDATE_PROBLEMS: [PERMISSIONS.MAKE_PROBLEMS],
	}

	export const PARENT_PERMISSIONS = {
		ADMIN: [],
		MAKE_CONTESTS: [PERMISSIONS.UPDATE_CONTESTS],
		MAKE_PROBLEMS: [PERMISSIONS.UPDATE_PROBLEMS],
		UPDATE_CONTESTS: [PERMISSIONS.ADMIN],
		UPDATE_PROBLEMS: [PERMISSIONS.ADMIN],
	}

	export async function hasPermission(user: User | bigint | null, permission: bigint) {

		if (user == null) {

			return false;

		} else if (typeof user == "bigint") {

			if ((user & permission) != 0n) {

				return true;

			}

			const parent = PARENT_PERMISSIONS[PERMISSION_NAMES[permission.toString()]];

			for (let i = 0; i < parent.length; i++) {

				if (await hasPermission(user, parent[i])) {

					return true;

				}

			}

			return false;

		} else {

			return hasPermission(user.admin, permission);

		}

	}

}

export default Permissions;
