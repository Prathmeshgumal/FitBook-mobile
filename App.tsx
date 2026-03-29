import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import VerifyOtpScreen from './screens/auth/VerifyOtpScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';

import OnboardingNavigator from './navigation/OnboardingNavigator';
import MainTabNavigator from './navigation/MainTabNavigator';
import { GymProvider, useGym } from './context/GymContext';
import { TokenStore, rawPost } from './api/client';
import type { AuthStackParamList } from './navigation/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,    // data fresh for 30s — no re-fetch on revisit
      gcTime: 5 * 60_000,   // keep in memory 5 minutes
      retry: 2,             // retry twice before showing error
    },
  },
});

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
    <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </AuthStack.Navigator>
);

type AppRoute = 'loading' | 'auth' | 'onboarding' | 'main';

const AppRouter = () => {
  const [route, setRoute] = useState<AppRoute>('loading');
  const { gym, refreshCount, refresh } = useGym();

  useEffect(() => {
    const bootstrap = async () => {
      let accessToken = await TokenStore.getAccess();

      // No access token — try to get one via the refresh token
      if (!accessToken) {
        const refreshToken = await TokenStore.getRefresh();
        if (!refreshToken) {
          setRoute('auth');
          return;
        }
        try {
          const tokens = await rawPost<{ access_token: string; refresh_token: string }>(
            '/auth/token/refresh',
            { refresh_token: refreshToken },
          );
          await TokenStore.save(tokens.access_token, tokens.refresh_token);
          accessToken = tokens.access_token;
        } catch {
          await TokenStore.clear();
          setRoute('auth');
          return;
        }
      }

      // We have a valid access token — fetch gym to decide where to land
      try {
        const currentGym = await refresh();
        setRoute(currentGym ? 'main' : 'onboarding');
      } catch {
        await TokenStore.clear();
        setRoute('auth');
      }
    };
    bootstrap();
  }, []);

  // After login or logout — refreshCount increments even when gym stays null
  useEffect(() => {
    if (route === 'loading') return;
    if (refreshCount === 0) return;
    setRoute(gym ? 'main' : 'onboarding');
  }, [gym, refreshCount]);

  if (route === 'loading') {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  if (route === 'auth') return <AuthNavigator />;
  if (route === 'onboarding') return <OnboardingNavigator />;
  return <MainTabNavigator />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GestureHandlerRootView style={styles.root}>
      <GymProvider>
        <NavigationContainer>
          <AppRouter />
        </NavigationContainer>
      </GymProvider>
    </GestureHandlerRootView>
  </QueryClientProvider>
);

export default App;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D1A2D' },
  loader: {
    flex: 1,
    backgroundColor: '#0D1A2D',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
