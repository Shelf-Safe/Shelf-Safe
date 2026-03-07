const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

export const getProfile = async () => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch profile');
  }

  return data.data;
};