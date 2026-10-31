import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  let envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  // If running on native mobile device/emulator and env is localhost, resolve true host IP
  if (Platform.OS !== 'web') {
    const hostUri = Constants.expoConfig?.hostUri || Constants.experienceUrl;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:5000/api`;
      }
    }
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';
    }
  }

  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }

  return 'http://localhost:5000/api';
};

export const API_URL = getBaseUrl();
console.log('🔗 API Base URL resolved to:', API_URL);

export function getImageUrl(photoUrl) {
  if (!photoUrl) return null;
  const apiHost = API_URL.replace(/\/api\/?$/, '');
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
    if (photoUrl.includes('localhost:5000') || photoUrl.includes('127.0.0.1:5000')) {
      return photoUrl.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/, apiHost);
    }
    return photoUrl;
  }
  if (photoUrl.startsWith('/')) {
    return `${apiHost}${photoUrl}`;
  }
  return photoUrl;
}

const getAuthToken = async () => {
  return await AsyncStorage.getItem('authToken');
};

const handleResponse = async (response) => {
  const json = await response.json();

  if (!response.ok || !json.success) {
    if (response.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userName');
      router.replace('/login');
      throw new Error('Please login again');
    }

    const message = json.message || json.error || 'Something went wrong';
    throw new Error(message);
  }

  if (json.data) {
    return json.data;
  }

  return json;
};

const handleNetworkError = (error) => {
  if (error.message === 'Network request failed' || error.name === 'TypeError') {
    throw new Error('Unable to connect to server');
  }
  throw error;
};

export async function registerUser(name, email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function createProof(proofData) {
  try {
    const token = await getAuthToken();
    const formData = new FormData();
    
    formData.append('orderId', proofData.orderId || '');
    formData.append('courier', proofData.courier || '');
    formData.append('condition', proofData.condition || '');
    formData.append('description', proofData.description || '');
    formData.append('latitude', proofData.latitude || '');
    formData.append('longitude', proofData.longitude || '');
    formData.append('address', proofData.address || '');

    if (proofData.photo) {
      const filename = proofData.photo.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      
      formData.append('photo', {
        uri: proofData.photo,
        name: filename,
        type: type,
      });
    }

    const response = await fetch(`${API_URL}/proofs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData,
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function getProofs() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/proofs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function getProofById(reportId) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/proofs/${reportId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function updateProofStatus(reportId, status) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/proofs/${reportId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status }),
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function deleteProof(reportId) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/proofs/${reportId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function updateProof(reportId, updateData) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/proofs/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updateData),
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function getUserProfile() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function updateUserProfile(profileData) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function getContacts() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/contacts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function createContact(contactData) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(contactData),
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function updateContact(id, contactData) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(contactData),
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}

export async function deleteContact(id) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}/contacts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return await handleResponse(response);
  } catch (error) {
    handleNetworkError(error);
  }
}
