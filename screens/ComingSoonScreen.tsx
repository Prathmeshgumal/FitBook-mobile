import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';

const ComingSoonScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue: 1, duration: 600, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: 0, duration: 600, useNativeDriver: true}),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <Animated.View style={[styles.content, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoLetter}>F</Text>
        </View>
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.sub}>
          We're working hard to bring{'\n'}FitBook to life. Stay tuned!
        </Text>
      </Animated.View>
    </View>
  );
};

export default ComingSoonScreen;

const BG = '#0D1A2D';

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center'},
  content: {alignItems: 'center', paddingHorizontal: 40},
  logoBox: {
    width: 72,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoLetter: {fontSize: 38, fontWeight: '900', color: BG},
  title: {fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginBottom: 16},
  sub: {fontSize: 15, color: '#8890A8', textAlign: 'center', lineHeight: 24},
});
