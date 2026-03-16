const cache = new Map();

export function getUserCache(token) {

	const item = cache.get(token);

	if (!item) return null;

	if (Date.now() > item.expiry) {
		cache.delete(token);
		return null;
	}

	return item.data;
}

export function setUserCache(token, data) {

	cache.set(token, {
		data,
		expiry: Date.now() + 5 * 60 * 1000 // 5 menit
	});
}

export function deleteUserCache(token) {
	cache.delete(token);
}