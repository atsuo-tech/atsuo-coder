import { sql } from "@/app/sql";
import Value from ".";
import { RowDataPacket } from "mysql2";

export class SQLValue<T> extends Value<T, string> {

	constructor(id: string, table: string, col: string, defaultValue: T, interval: number = 1800000) {

		super(id, defaultValue, interval, async (id) => {

			return await sql.query<RowDataPacket[]>(`SELECT ${col} FROM ${table} WHERE id = ?`, [id]).then((rows) => {

				if (defaultValue instanceof Date) {

					return new Date(rows[0][0][col]);

				}

				if (typeof defaultValue == "object") {

					return JSON.parse(rows[0][0][col]);

				}

				return rows[0][0][col];

			});

		}, async (value, id) => {

			await sql.query(`UPDATE ${table} SET ${col} = ? WHERE id = ?`, [this.type == "raw" ? value : this.type == "date" ? (value as Date).getTime() : JSON.stringify(value), id]);

		});

		if (typeof defaultValue == "object") {

			this.type = "object";

		} else if (defaultValue instanceof Date) {

			this.type = "date";

		} else {

			this.type = "raw";

		}

	}

	private type: "raw" | "object" | "date";

}

export async function makeRawSQLValue<T>(id: string, table: string, col: string, interval: number = 1800000) {

	return await sql.query<RowDataPacket[]>(`SELECT ${col} FROM ${table} WHERE id = ?`, [id]).then((rows) => {

		return new SQLValue<T>(id, table, col, rows[0][0][col], interval);

	});

}

export async function makeObjectSQLValue<T>(id: string, table: string, col: string, interval: number = 1800000) {

	return await sql.query<RowDataPacket[]>(`SELECT ${col} FROM ${table} WHERE id = ?`, [id]).then((rows) => {

		return new SQLValue<T>(id, table, col, JSON.parse(rows[0][0][col]), interval);

	});

}

export async function makeDateSQLValue(id: string, table: string, col: string, interval: number = 1800000) {

	return await sql.query<RowDataPacket[]>(`SELECT ${col} FROM ${table} WHERE id = ?`, [id]).then((rows) => {

		return new SQLValue<Date>(id, table, col, new Date(rows[0][0][col]), interval);

	});

}