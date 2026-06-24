import { auth } from './appwrite';

export const callAPI = async (url: string, body: any) => {
  const userId = auth.currentUser?.uid || 'guest';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    body: JSON.stringify(body),
  });

  if (response.status === 429) {
    const data = await response.json();
    throw { rateLimited: true, message: data.message || 'Too many requests. Please wait a moment.' };
  }

  if (!response.ok) {
    throw new Error('Request failed: ' + response.status);
  }

  return response.json();
};

// Strip accidental extra quotes from strings stored in Firestore (e.g. "\"https://...\"")
export const cleanString = (value: any): string => {
  if (!value) return '';
  let str = String(value).trim();
  // Remove surrounding double quotes if present
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.slice(1, -1);
  }
  return str;
};
