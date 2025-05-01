import { redis } from '../main.ts';

/**
 * Ensures both user nodes exist and creates a 'MATCH' relationship between them with a specified weight.
 * @param {string} userId1 - The ID of the first user.
 * @param {string} userId2 - The ID of the second user.
 * @param {number} weight - The weight of the relationship.
 */
export async function createMatchRelation(
	userId1: number,
	userId2: number,
	weight: number,
	graph: string
) {
	const query = `
	  MERGE (a:User {id: '${userId1}'})
	  MERGE (b:User {id: '${userId2}'})
	  MERGE (a)-[:MATCH {weight: ${weight}}]->(b)
	  MERGE (b)-[:MATCH {weight: ${weight}}]->(a)
	`;

	const result = await redis.sendCommand('GRAPH.QUERY', [graph, query]);
	return result;
}

/**
 * Retrieves the top 10 users most strongly connected to the specified user.
 * @param userId - The ID of the user for whom to find the top connections.
 */
export async function getTopWeightedMatches(
	userId: number,
	graph: string,
	limit: number
): Promise<number[]> {
	const query = `
	  MATCH (u:User {id: '${userId}'})-[r:MATCH]->(other:User)
	  RETURN other.id AS userId, r.weight AS weight
	  ORDER BY r.weight DESC
	  LIMIT ${limit}
	`;

	const result = await redis.sendCommand('GRAPH.QUERY', [graph, query]);

	if (Array.isArray(result) && Array.isArray(result[1])) {
		// deno-lint-ignore no-explicit-any
		const userIds = result[1].map((elem: any) => Number(elem[0]));
		return userIds;
	}
	return [];
}
