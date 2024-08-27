import { notFound } from "next/navigation";
import React from "react";
import { hasAdminPremission } from "../../../lib/accounts/permission";

export default async function Layout({ children }: { children: React.ReactNode }) {

	if (!(await hasAdminPremission())) {

		notFound();

	}

	return <>{children}</>;

}