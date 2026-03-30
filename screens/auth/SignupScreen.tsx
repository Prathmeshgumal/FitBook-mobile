import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { requestOnboarderOtp, register } from '../../api/auth';
import type { SignupScreenProps } from '../../navigation/types';

const SignupScreen = ({ navigation }: SignupScreenProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [onboarderOtp, setOnboarderOtp] = useState('');
  const [focused, setFocused] = useState<
    'name' | 'phone' | 'email' | 'password' | 'confirm' | 'onboarderOtp' | null
  >(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  const cardAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardAnim, {
        toValue: 0,
        damping: 18,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRequestOnboarderOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('Enter a valid email address first.');
      return;
    }
    setError('');
    setRequestingOtp(true);
    try {
      await requestOnboarderOtp(email);
      setOtpRequested(true);
    } catch (err: any) {
      setError(err.message ?? 'Failed to request OTP.');
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleSignup = async () => {
    if (
      !name ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword ||
      !onboarderOtp
    ) {
      setError('All fields are required.');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({
        full_name: name,
        phone,
        email,
        password,
        onboarder_otp: onboarderOtp,
      });
      navigation.navigate('VerifyOtp', { email, flow: 'signup' });
    } catch (err: any) {
      setError(err.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Top dark section */}
      <Animated.View style={[styles.topSection, { opacity: fadeAnim }]}>
        <Text style={styles.topTitle}>Create Your</Text>
        <Text style={styles.topTitle}>Account</Text>
      </Animated.View>

      {/* White card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <Animated.View
          style={[styles.card, { transform: [{ translateY: cardAnim }] }]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.cardScroll}
          >
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  focused === 'name' && styles.inputFocused,
                ]}
                value={name}
                onChangeText={setName}
                placeholder="John Smith"
                placeholderTextColor={PLACEHOLDER}
                autoCapitalize="words"
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[
                  styles.input,
                  focused === 'phone' && styles.inputFocused,
                ]}
                value={phone}
                onChangeText={t => setPhone(t.replace(/\D/g, ''))}
                placeholder="9876543210"
                placeholderTextColor={PLACEHOLDER}
                keyboardType="phone-pad"
                maxLength={10}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  focused === 'email' && styles.inputFocused,
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="john@email.com"
                placeholderTextColor={PLACEHOLDER}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputFlex,
                    focused === 'password' && styles.inputFocused,
                  ]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••"
                  placeholderTextColor={PLACEHOLDER}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#8890A8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputFlex,
                    focused === 'confirm' && styles.inputFocused,
                  ]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••"
                  placeholderTextColor={PLACEHOLDER}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(v => !v)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                    }
                    size={20}
                    color="#8890A8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Onboarder OTP</Text>
                <TouchableOpacity
                  onPress={handleRequestOnboarderOtp}
                  disabled={requestingOtp}
                >
                  {requestingOtp ? (
                    <ActivityIndicator size="small" color={BG} />
                  ) : (
                    <Text style={styles.requestLink}>
                      {otpRequested ? 'Resend Code' : 'Request Code'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focused === 'onboarderOtp' && styles.inputFocused,
                ]}
                value={onboarderOtp}
                onChangeText={setOnboarderOtp}
                placeholder="6-digit code from your onboarder"
                placeholderTextColor={PLACEHOLDER}
                keyboardType="number-pad"
                maxLength={6}
                onFocus={() => setFocused('onboarderOtp')}
                onBlur={() => setFocused(null)}
              />
              {otpRequested && (
                <Text style={styles.otpHint}>
                  Code sent to admin. Ask your onboarder for it.
                </Text>
              )}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSignup}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>SIGN UP</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerSub}>Already Sign Up?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}> Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignupScreen;

const BG = '#0D1A2D';
const CARD = '#FFFFFF';
const PLACEHOLDER = '#C0C0C0';
const DIVIDER = '#E8E8E8';
const FOOTER_SUB = '#999999';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },

  topSection: {
    paddingTop: 64,
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  topTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 44,
  },

  card: {
    flex: 1,
    backgroundColor: CARD,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  cardScroll: {
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 24,
  },

  fieldWrap: { marginBottom: 22 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  requestLink: {
    fontSize: 13,
    color: BG,
    fontWeight: '600',
  },
  otpHint: {
    fontSize: 12,
    color: '#8890A8',
    marginTop: 6,
  },
  input: {
    fontSize: 15,
    color: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
    paddingBottom: 10,
    padding: 0,
  },
  inputFocused: { borderBottomColor: BG },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  inputFlex: { flex: 1, borderBottomWidth: 0 },
  eyeBtn: { paddingBottom: 8, paddingLeft: 8 },

  errorText: {
    fontSize: 13,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 12,
  },

  btn: {
    backgroundColor: BG,
    borderRadius: 30,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.5,
  },

  footer: {
    backgroundColor: CARD,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingTop: 8,
  },
  footerSub: { fontSize: 14, color: FOOTER_SUB },
  footerLink: { fontSize: 14, color: '#1A1A1A', fontWeight: '700' },
});
