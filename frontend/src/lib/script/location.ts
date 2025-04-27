export async function getCurrentPosition(
	latitude: number | undefined,
	longitude: number | undefined
) {
	if (latitude === undefined || longitude === undefined) {
		return '';
	}
	try {
		const response = await fetch(
			`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
		);
		const data = await response.json();
		if (data) {
			return data.city;
		}
	} catch (error) {
		console.error('Error fetching location data :', error);
		return '';
	}
}

export async function fetchLocationByIP() {
	try {
		const response = await fetch('http://ip-api.com/json/');
		if (!response.ok) throw new Error('Failed to fetch location by IP');
		const data = await response.json();
		return {
			latitude: data.lat,
			longitude: data.lon,
			city: data.city || 'Unknown'
		};
	} catch (error) {
		console.error('Failed to fetch location by IP:', error);
		return null;
	}
}

