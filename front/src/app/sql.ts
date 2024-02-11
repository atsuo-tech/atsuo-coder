import mysql from "mysql2/promise";

export const sql = await mysql.createConnection({
	user: "atsuo_judge",
	database: "atsuo_judge",
	password: process.env.db_password,
	stringifyObjects: true,
});
