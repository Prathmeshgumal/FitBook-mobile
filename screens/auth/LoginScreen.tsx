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
import { login } from '../../api/auth';

type Props = {
  onNavigate: (
    screen: 'signup' | 'comingSoon' | 'forgotPassword',
    params?: Record<string, string>,
  ) => void;
};

const LoginScreen = ({ onNavigate }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onNavigate('comingSoon');
    } catch (err: any) {
      setError(err.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Top dark section */}
      <Animated.View style={[styles.topSection, { opacity: fadeAnim }]}>
        <Text style={styles.topHello}>Hello</Text>
        <Text style={styles.topTitle}>Sign In</Text>
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
              <TextInput
                style={[
                  styles.input,
                  focused === 'password' && styles.inputFocused,
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••"
                placeholderTextColor={PLACEHOLDER}
                secureTextEntry
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotWrap}
              onPress={() => onNavigate('forgotPassword')}
            >
              <Text style={styles.forgot}>Forget password?</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>SIGN IN</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerSub}>Dont have an account?</Text>
        <TouchableOpacity onPress={() => onNavigate('signup')}>
          <Text style={styles.footerLink}> Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

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
  topHello: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 44,
  },
  topTitle: {
    fontSize: 38,
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
    paddingTop: 36,
    paddingBottom: 24,
  },

  fieldWrap: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
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

  forgotWrap: { alignSelf: 'flex-end', marginBottom: 12 },
  forgot: { fontSize: 13, color: FOOTER_SUB },

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
