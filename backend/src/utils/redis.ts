import { redis, redis_graph } from '../main.ts';

/**
 * Ensures both user nodes exist and creates a 'MATCH' relationship between them with a specified weight.
 * @param {string} userId1 - The ID of the first user.
 * @param {string} userId2 - The ID of the second user.
 * @param {number} weight - The weight of the relationship.
 */
export async function createMatchRelation(
	userId1: string,
	userId2: string,
	weight: number
) {
	const query = `
	  MERGE (a:User {id: '${userId1}'})
	  MERGE (b:User {id: '${userId2}'})
	  MERGE (a)-[:MATCH {weight: ${weight}}]->(b)
	`;

	const result = await redis.sendCommand('GRAPH.QUERY', [redis_graph, query]);
	console.log('Relationship created or updated:', result);
	return result;
}

/**
 * Retrieves the top 10 users most strongly connected to the specified user.
 * @param userId - The ID of the user for whom to find the top connections.
 */
export async function getTopWeightedMatches(userId: string) {
	const query = `
	  MATCH (u:User {id: '${userId}'})-[r:MATCH]->(other:User)
	  RETURN other.id AS userId, r.weight AS weight
	  ORDER BY r.weight DESC
	  LIMIT 10
	`;

	const result = await redis.sendCommand('GRAPH.QUERY', [redis_graph, query]);
	console.log('Top matches:', result);
	return result;
}
