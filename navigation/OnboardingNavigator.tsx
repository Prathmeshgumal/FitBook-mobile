import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';
import GymSetupScreen from '../screens/onboarding/GymSetupScreen';
import AddPlansScreen from '../screens/onboarding/AddPlansScreen';
import AddBatchesScreen from '../screens/onboarding/AddBatchesScreen';
import SetupCompleteScreen from '../screens/onboarding/SetupCompleteScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="GymSetup" component={GymSetupScreen} />
    <Stack.Screen name="AddPlans" component={AddPlansScreen} />
    <Stack.Screen name="AddBatches" component={AddBatchesScreen} />
    <Stack.Screen name="SetupComplete" component={SetupCompleteScreen} />
  </Stack.Navigator>
);

export default OnboardingNavigator;
