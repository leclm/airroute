const API_BASE_URL = 'https://recruiting-assessment.alphasights.com/api';

export async function apiFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Request error: ${response.status}`);
  }

  return await response.json();
}
