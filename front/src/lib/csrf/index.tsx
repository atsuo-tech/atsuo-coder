import { sql } from "@/app/sql";

export interface CSRFToken {

	id: string;
	user: string;

	use_to: string;
	created_at: Date;
}

export default async function getCTToken(id: string): Promise<CSRFToken | null> {

	return new Promise<CSRFToken | null>((resolve, reject) => {

		sql.query("SELECT * FROM csrf_tokens WHERE id = ?", [id]).then((result) => {

			const tokens = (result[0] as any[]);

			if (tokens.length == 0) {

				resolve(null);

			}

			const token = tokens[0];

			resolve({ created_at: new Date(token.created_at), id, use_to: token.use_to, user: token.user_id } as CSRFToken);

		});

	});

}