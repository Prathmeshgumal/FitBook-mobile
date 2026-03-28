import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, ActivityIndicator, View } from 'react-native';

import SplashScreen from './screens/auth/SplashScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import VerifyOtpScreen from './screens/auth/VerifyOtpScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';

import OnboardingNavigator from './navigation/OnboardingNavigator';
import MainTabNavigator from './navigation/MainTabNavigator';
import { GymProvider, useGym } from './context/GymContext';
import { TokenStore } from './api/client';
import type { AuthStackParamList } from './navigation/types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
    <AuthStack.Screen name="Splash" component={SplashScreen} />
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
  const { gym, refresh } = useGym();

  useEffect(() => {
    const bootstrap = async () => {
      const token = await TokenStore.getAccess();
      if (!token) {
        setRoute('auth');
        return;
      }
      try {
        await refresh();
        // gym state is set by refresh — handled below
      } catch {
        setRoute('auth');
      }
    };
    bootstrap();
  }, []);

  // Once gym context resolves, pick the right route
  useEffect(() => {
    if (route === 'loading') return;
    if (route === 'auth') return;
    setRoute(gym ? 'main' : 'onboarding');
  }, [gym]);

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
  <GestureHandlerRootView style={styles.root}>
    <GymProvider>
      <NavigationContainer>
        <AppRouter />
      </NavigationContainer>
    </GymProvider>
  </GestureHandlerRootView>
);

export default App;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D1A2D' },
  loader: { flex: 1, backgroundColor: '#0D1A2D', alignItems: 'center', justifyContent: 'center' },
});
