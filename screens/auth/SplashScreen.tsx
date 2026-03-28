import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { TokenStore, rawPost } from '../../api/client';
import { useGym } from '../../context/GymContext';
import type { SplashScreenProps } from '../../navigation/types';

const SplashScreen = ({ navigation }: SplashScreenProps) => {
  const { refresh } = useGym();

  useEffect(() => {
    const bootstrap = async () => {
      const refreshToken = await TokenStore.getRefresh();
      if (!refreshToken) {
        navigation.replace('Login');
        return;
      }
      try {
        const tokens = await rawPost<{ access_token: string; refresh_token: string }>(
          '/auth/token/refresh',
          { refresh_token: refreshToken },
        );
        await TokenStore.save(tokens.access_token, tokens.refresh_token);
        // Gym context check happens in App.tsx after token is valid
        navigation.replace('Login');
      } catch {
        await TokenStore.clear();
        navigation.replace('Login');
      }
    };
    bootstrap();
  }, []);

  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D1A2D', justifyContent: 'center', alignItems: 'center' },
});
