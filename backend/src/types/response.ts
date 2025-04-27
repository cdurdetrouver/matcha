import { ResultRecord, ResultRow } from 'ts-postgres';

export default interface response {
	rows: ResultRow<ResultRecord<string>>[];
}
