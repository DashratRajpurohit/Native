import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { getUserProfile } from '../services/api';

export function useAuth() {
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedName = await AsyncStorage.getItem('userName');
      setToken(storedToken);
      setUserName(storedName || 'User');

      if (storedToken) {
        try {
          const profile = await getUserProfile();
          setUserProfile(profile);
          if (profile?.name) {
            setUserName(profile.name);
            await AsyncStorage.setItem('userName', profile.name);
          }
        } catch (e) {
          console.warn('Could not refresh profile:', e.message);
        }
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userName');
    setToken(null);
    setUserProfile(null);
    router.replace('/login');
  };

  return { token, userName, userProfile, loading, logout, reloadProfile: loadAuthData };
}
