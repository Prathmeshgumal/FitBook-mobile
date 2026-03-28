import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, StatusBar,
  Animated, ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { updateMember } from '../../api/members';
import type { AddMemberStep2ScreenProps } from '../../navigation/types';

const AddMemberStep2Screen = ({ route, navigation }: AddMemberStep2ScreenProps) => {
  const { memberId } = route.params;
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      await updateMember(memberId, {
        email: email || undefined,
        date_of_birth: dob || undefined,
        address: address || undefined,
      });
      // Go back to members list, replacing the add flow
      navigation.popToTop();
    } catch (err: any) {
      setError(err.message ?? 'Failed to save details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.popToTop();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <Animated.View style={[styles.topSection, { opacity: fadeAnim }]}>
        <Text style={styles.stepLabel}>Step 2 of 2</Text>
        <Text style={styles.topTitle}>Personal Details</Text>
        <Text style={styles.topSub}>Optional — you can fill these in later</Text>
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <Animated.View style={[styles.card, { transform: [{ translateY: cardAnim }] }]}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.cardScroll}>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail}
                placeholder="member@email.com" placeholderTextColor={PLACEHOLDER}
                keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput style={styles.input} value={dob} onChangeText={setDob}
                placeholder="YYYY-MM-DD" placeholderTextColor={PLACEHOLDER}
                keyboardType="numbers-and-punctuation" />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Address</Text>
              <TextInput style={[styles.input, { minHeight: 60 }]} value={address} onChangeText={setAddress}
                placeholder="Street, City, State" placeholderTextColor={PLACEHOLDER}
                multiline />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>SAVE & FINISH</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddMemberStep2Screen;

const BG = '#0D1A2D';
const PLACEHOLDER = '#C0C0C0';
const DIVIDER = '#E8E8E8';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  topSection: { paddingTop: 56, paddingHorizontal: 32, paddingBottom: 32 },
  stepLabel: { fontSize: 12, color: '#8890A8', fontWeight: '600', letterSpacing: 1, marginBottom: 6 },
  topTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', lineHeight: 38 },
  topSub: { fontSize: 14, color: '#8890A8', marginTop: 6 },
  card: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  cardScroll: { paddingHorizontal: 32, paddingTop: 36, paddingBottom: 24 },
  fieldWrap: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#1A1A1A', marginBottom: 8 },
  input: { fontSize: 15, color: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: DIVIDER, paddingBottom: 10, padding: 0 },
  errorText: { fontSize: 13, color: '#E53935', textAlign: 'center', marginBottom: 12 },
  btn: { backgroundColor: BG, borderRadius: 30, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 1.5 },
  skipBtn: { alignItems: 'center', paddingVertical: 16 },
  skipText: { fontSize: 14, color: '#999999', fontWeight: '500' },
});
