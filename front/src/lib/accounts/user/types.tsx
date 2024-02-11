export interface Token {

	cc: string;
	ct: string;

	user: string;

	created_at: Date;

}

export interface User {

	id: string;
	password: string;

	name: [string] | [string, string] | [string, string, string];

	grade: number;

	admin: bigint;

}
