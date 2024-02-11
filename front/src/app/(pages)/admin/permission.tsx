import getUser from "@/lib/user";
import { Permissions } from "@/lib/user";

export async function hasAdminPremission() {

	"use server";

	const user = await getUser();

	return user && Permissions.hasPermission(await user.permission!!.get(), Permissions.BasePermissions.Admin);

}

export async function hasContestAdminPermission() {

	"use server";

	if (await hasAdminPremission()) {

		return true;

	}

	const user = await getUser();

	return user && Permissions.hasPermission(await user.permission!!.get(), Permissions.BasePermissions.ContestAdmin);

}

export async function hasContestMakerPermission() {

	"use server";

	if (await hasContestAdminPermission()) {

		return true;

	}

	const user = await getUser();

	return user && Permissions.hasPermission(await user.permission!!.get(), Permissions.BasePermissions.ContestMaker);

}

export async function hasProblemAdminPermission() {

	"use server";

	if (await hasAdminPremission()) {

		return true;

	}

	const user = await getUser();

	return user && Permissions.hasPermission(await user.permission!!.get(), Permissions.BasePermissions.ProblemAdmin);

}

export async function hasProblemMakerPermission() {

	"use server";

	if (await hasProblemAdminPermission()) {

		return true;

	}

	const user = await getUser();

	return user && Permissions.hasPermission(await user.permission!!.get(), Permissions.BasePermissions.ProblemMaker);

}

export async function hasUserAdminPermission() {

	"use server";

	if(await hasAdminPremission()) {

		return true;

	}

	const user = await getUser();

	return user && Permissions.hasPermission(await user.permission!!.get(), Permissions.BasePermissions.UserAdmin);

}

export async function hasUserApproverPermission() {

	"use server";

	if(await hasUserAdminPermission()) {

		return true;

	}

	const user = await getUser();

	return user && Permissions.hasPermission(await user.permission!!.get(), Permissions.BasePermissions.UserApprover);

}
