import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// This screen is no longer used — App.tsx handles all bootstrap routing.
// Kept as a named export to avoid breaking any imports.
const SplashScreen = () => (
  <View style={styles.root}>
    <ActivityIndicator size="large" color="#FFFFFF" />
  </View>
);

export default SplashScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D1A2D', justifyContent: 'center', alignItems: 'center' },
});
