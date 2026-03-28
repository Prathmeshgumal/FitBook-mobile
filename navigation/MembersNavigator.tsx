import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MembersStackParamList } from './types';
import MembersListScreen from '../screens/members/MembersListScreen';
import MemberDetailScreen from '../screens/members/MemberDetailScreen';
import AddMemberStep1Screen from '../screens/members/AddMemberStep1Screen';
import AddMemberStep2Screen from '../screens/members/AddMemberStep2Screen';

const Stack = createNativeStackNavigator<MembersStackParamList>();

const MembersNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="MembersList" component={MembersListScreen} />
    <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
    <Stack.Screen name="AddMemberStep1" component={AddMemberStep1Screen} />
    <Stack.Screen name="AddMemberStep2" component={AddMemberStep2Screen} />
  </Stack.Navigator>
);

export default MembersNavigator;
