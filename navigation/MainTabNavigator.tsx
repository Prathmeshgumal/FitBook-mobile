import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { MainTabParamList } from './types';
import MembersNavigator from './MembersNavigator';
import ComingSoonScreen from '../screens/ComingSoonScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const BG = '#0D1A2D';
const ACTIVE = '#FFFFFF';
const INACTIVE = '#607080';

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: BG, borderTopWidth: 0, paddingBottom: 4 },
      tabBarActiveTintColor: ACTIVE,
      tabBarInactiveTintColor: INACTIVE,
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, string> = {
          Members: 'people-outline',
          Dashboard: 'pie-chart-outline',
          Settings: 'settings-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Members" component={MembersNavigator} />
    <Tab.Screen name="Dashboard" component={ComingSoonScreen} />
    <Tab.Screen name="Settings" component={ComingSoonScreen} />
  </Tab.Navigator>
);

export default MainTabNavigator;
