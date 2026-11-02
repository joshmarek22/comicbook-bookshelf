const comicVineBaseUrl = process.env.COMIC_VINE_API_BASE_URL
  || 'https://comicvine.gamespot.com/api';

function getComicVineAuth() {
  const apiKey = process.env.COMIC_VINE_API_KEY;

  if (!apiKey) {
    const error = new Error('Comic Vine API credentials are not configured');
    error.statusCode = 503;
    throw error;
  }

  return { api_key: apiKey, format: 'json' };
}

export async function requestComicVine(path, params = {}) {
  const url = new URL(`${comicVineBaseUrl}/${path}/`);
  const query = { ...params, ...getComicVineAuth() };

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`Comic Vine API request failed with status ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  const payload = await response.json();
  if (payload.status_code !== 1) {
    const error = new Error(`Comic Vine API request failed: ${payload.error}`);
    error.statusCode = 502;
    throw error;
  }

  return payload;
}