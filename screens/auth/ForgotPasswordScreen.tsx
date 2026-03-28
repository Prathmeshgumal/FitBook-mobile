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
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { requestForgotPasswordOtp } from '../../api/auth';

type Props = {
  onNavigate: (screen: 'login' | 'verifyOtp', params?: Record<string, string>) => void;
};

const ForgotPasswordScreen = ({ onNavigate }: Props) => {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
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

  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestForgotPasswordOtp(email);
      onNavigate('verifyOtp', { email, flow: 'forgotPassword' });
    } catch (err: any) {
      setError(err.message ?? 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <Animated.View style={[styles.topSection, { opacity: fadeAnim }]}>
        <Text style={styles.topTitle}>Forgot</Text>
        <Text style={styles.topTitle}>Password?</Text>
        <Text style={styles.topSub}>Enter your email to receive a reset code.</Text>
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <Animated.View style={[styles.card, { transform: [{ translateY: cardAnim }] }]}>
          <View style={styles.cardContent}>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, focused && styles.inputFocused]}
                value={email}
                onChangeText={setEmail}
                placeholder="john@email.com"
                placeholderTextColor={PLACEHOLDER}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSendCode}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>SEND CODE</Text>
              )}
            </TouchableOpacity>

          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Text style={styles.footerSub}>Remember your password?</Text>
        <TouchableOpacity onPress={() => onNavigate('login')}>
          <Text style={styles.footerLink}> Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;

const BG = '#0D1A2D';
const CARD = '#FFFFFF';
const PLACEHOLDER = '#C0C0C0';
const DIVIDER = '#E8E8E8';
const FOOTER_SUB = '#999999';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },

  topSection: {
    paddingTop: 72,
    paddingHorizontal: 32,
    paddingBottom: 36,
  },
  topTitle: { fontSize: 38, fontWeight: '800', color: '#FFFFFF', lineHeight: 46 },
  topSub: { fontSize: 14, color: '#8890A8', marginTop: 12 },

  card: {
    flex: 1,
    backgroundColor: CARD,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
  },

  fieldWrap: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#1A1A1A', marginBottom: 8 },
  input: {
    fontSize: 15,
    color: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
    paddingBottom: 10,
    padding: 0,
  },
  inputFocused: { borderBottomColor: BG },

  errorText: { fontSize: 13, color: '#E53935', textAlign: 'center', marginBottom: 12 },

  btn: {
    backgroundColor: BG,
    borderRadius: 30,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 1.5 },

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
