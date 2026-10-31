import crypto from 'node:crypto';

const marvelBaseUrl = process.env.MARVEL_API_BASE_URL
  || 'https://gateway.marvel.com/v1/public';

function getMarvelAuth() {
  const { MARVEL_PUBLIC_KEY: publicKey, MARVEL_PRIVATE_KEY: privateKey } = process.env;

  if (!publicKey || !privateKey) {
    const error = new Error('Marvel API credentials are not configured');
    error.statusCode = 503;
    throw error;
  }

  const timestamp = Date.now().toString();
  const hash = crypto
    .createHash('md5')
    .update(timestamp + privateKey + publicKey)
    .digest('hex');

  return { ts: timestamp, apikey: publicKey, hash };
}

export async function requestMarvel(path, params = {}) {
  const url = new URL(`${marvelBaseUrl}/${path}`);
  const query = { ...params, ...getMarvelAuth() };

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`Marvel API request failed with status ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  return response.json();
}