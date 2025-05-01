import type { UserType } from '../types/user.ts';

function calculateAge(birthdate?: string): number | null {
	if (!birthdate) return null;
	const birth = new Date(birthdate);
	const now = new Date();
	let age = now.getFullYear() - birth.getFullYear();
	const m = now.getMonth() - birth.getMonth();
	if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
		age--;
	}
	return age;
}

function haversineDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number {
	const toRad = (value: number) => (value * Math.PI) / 180;
	const R = 6371;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

function mbtiCompatibility(typeA?: string, typeB?: string): number {
	if (!typeA || !typeB || typeA.length !== 4 || typeB.length !== 4) return 0;
	let matchCount = 0;
	for (let i = 0; i < 4; i++) {
		if (typeA[i] === typeB[i]) matchCount++;
	}
	return matchCount / 4;
}

export function similarityScore(
	userA: UserType,
	userB: UserType,
	userA_tags: string[],
	userB_tags: string[]
): number {
	if (
		(userA.wanted === 0 && userB.wanted === 2) ||
		(userA.wanted === 2 && userB.wanted === 0)
	) {
		return 0;
	}

	let score = 0;
	let maxScore = 0;

	maxScore += 6;
	if (
		userB.sexual_preferences &&
		userA.sexual_preferences &&
		userB.sexual_preferences === userA.sexual_preferences
	) {
		score += 3;
		if (userA.gender && userB.gender && userA.gender === userB.gender) {
			score +=
				userA.gender !== 'Male' && userA.gender !== 'Female' ? 3 : 2;
		}
	}

	maxScore += 6;
	const mbtiScore = mbtiCompatibility(userA.mbti, userB.mbti) * 6;
	score += mbtiScore;

	maxScore += 5;
	const distance = haversineDistance(
		userA.location[0],
		userA.location[1],
		userB.location[0],
		userB.location[1]
	);
	const locationScore = Math.max(0, 1 - distance / 100) * 5;
	score += locationScore;

	maxScore += 4;
	const tagsA = new Set(userA_tags || []);
	const tagsB = new Set(userB_tags || []);
	let shared = 0;
	for (const tag of tagsA) {
		if (tagsB.has(tag)) shared++;
	}
	score += Math.min(shared, 4);

	maxScore += 2;
	score += userA.wanted === 1 || userB.wanted === 1 ? 1 : 2;

	maxScore += 3;
	const ageA = calculateAge(userA.birthdate);
	const ageB = calculateAge(userB.birthdate);
	if (ageA !== null && ageB !== null) {
		const diff = Math.abs(ageA - ageB);
		const ageScore = Math.max(0, 1 - diff / 10) * 3;
		score += ageScore;
	}

	return score / maxScore;
}
