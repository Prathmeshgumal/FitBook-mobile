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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { resetPassword } from '../../api/auth';

type Props = {
  email?: string;
  resetToken?: string;
  onNavigate: (screen: 'login') => void;
};

const ResetPasswordScreen = ({ email, resetToken, onNavigate }: Props) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focused, setFocused] = useState<'password' | 'confirm' | null>(null);
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

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      setError('All fields are required.');
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
    if (!resetToken) {
      setError('Invalid reset session. Please start over.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(resetToken, password);
      Alert.alert('Success', 'Your password has been reset. Please sign in.', [
        { text: 'Sign In', onPress: () => onNavigate('login') },
      ]);
    } catch (err: any) {
      setError(err.message ?? 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <Animated.View style={[styles.topSection, { opacity: fadeAnim }]}>
        <Text style={styles.topTitle}>Reset</Text>
        <Text style={styles.topTitle}>Password</Text>
        <Text style={styles.topSub}>Enter your new password below.</Text>
      </Animated.View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <Animated.View style={[styles.card, { transform: [{ translateY: cardAnim }] }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.cardScroll}>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={[styles.input, focused === 'password' && styles.inputFocused]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••"
                placeholderTextColor={PLACEHOLDER}
                secureTextEntry
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={[styles.input, focused === 'confirm' && styles.inputFocused]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••"
                placeholderTextColor={PLACEHOLDER}
                secureTextEntry
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused(null)}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleReset}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>RESET PASSWORD</Text>
              )}
            </TouchableOpacity>

          </ScrollView>
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

export default ResetPasswordScreen;

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
  cardScroll: {
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 24,
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
