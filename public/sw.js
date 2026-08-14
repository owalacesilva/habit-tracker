/* Hand-rolled service worker — no build step, no extra dependency.
 * Bump CACHE_VERSION whenever the offline shell changes. */
const CACHE_VERSION = "v1";
const CACHE_NAME = `habit-tracker-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

/* Authenticated pages are deliberately NOT precached — only the shell. */
const PRECACHE_URLS = [
	OFFLINE_URL,
	"/manifest.webmanifest",
	"/icons/icon-192.png",
	"/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(PRECACHE_URLS))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CACHE_NAME)
						.map((key) => caches.delete(key)),
				),
			)
			.then(() => self.clients.claim()),
	);
});

function isStaticAsset(url) {
	return (
		url.pathname.startsWith("/_next/static/") ||
		url.pathname.startsWith("/icons/") ||
		/\.(?:css|js|png|jpg|jpeg|svg|webp|woff2?)$/.test(url.pathname)
	);
}

self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Never interfere with writes, other origins, or auth/API traffic.
	if (request.method !== "GET" || url.origin !== self.location.origin) return;
	if (url.pathname.startsWith("/api/")) return;

	// Navigations: network first, fall back to cache, then the offline page.
	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((response) => {
					const copy = response.clone();
					caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
					return response;
				})
				.catch(() =>
					caches
						.match(request)
						.then((cached) => cached || caches.match(OFFLINE_URL)),
				),
		);
		return;
	}

	// Immutable build output: cache first.
	if (isStaticAsset(url)) {
		event.respondWith(
			caches.match(request).then(
				(cached) =>
					cached ||
					fetch(request).then((response) => {
						const copy = response.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
						return response;
					}),
			),
		);
	}
});
