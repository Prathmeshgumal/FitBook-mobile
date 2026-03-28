import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useGym } from '../../context/GymContext';
import type { SetupCompleteScreenProps } from '../../navigation/types';

const SetupCompleteScreen = ({ navigation }: SetupCompleteScreenProps) => {
  const { refresh } = useGym();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGoToApp = async () => {
    // Refresh gym context — App.tsx will react and switch to MainTabNavigator
    await refresh();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </Animated.View>
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>
          Your gym is ready. Start adding members and managing your fitness business.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={handleGoToApp} activeOpacity={0.85}>
          <Text style={styles.btnText}>GO TO APP</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default SetupCompleteScreen;

const BG = '#0D1A2D';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' },
  container: { alignItems: 'center', paddingHorizontal: 40 },
  iconWrap: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 15, color: '#8890A8', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  btn: { backgroundColor: '#FFFFFF', borderRadius: 30, height: 54, paddingHorizontal: 48, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: BG, fontSize: 15, fontWeight: '800', letterSpacing: 1.5 },
});
