import { ResultRecord, ResultRow } from "ts-postgres";

export interface response {
	rows: ResultRow<ResultRecord<string>>[];
}