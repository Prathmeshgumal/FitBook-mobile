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
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  verifySignupEmail,
  verifyForgotPasswordOtp,
  requestForgotPasswordOtp,
} from '../../api/auth';

type Props = {
  email?: string;
  flow: 'signup' | 'forgotPassword';
  onBack: () => void;
  onVerified: (data?: { reset_token?: string }) => void;
};

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const VerifyOtpScreen = ({ email, flow, onBack, onVerified }: Props) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const inputs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

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

  useEffect(() => {
    if (resendTimer === 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Enter the full 6-digit code.');
      return;
    }
    if (!email) {
      setError('Email is missing. Please go back and try again.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (flow === 'signup') {
        await verifySignupEmail(email, code);
        onVerified();
      } else {
        const { reset_token } = await verifyForgotPasswordOtp(email, code);
        onVerified({ reset_token });
      }
    } catch (err: any) {
      setError(err.message ?? 'Incorrect code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setResendTimer(RESEND_SECONDS);
    inputs.current[0]?.focus();

    if (flow === 'forgotPassword' && email) {
      try {
        await requestForgotPasswordOtp(email);
      } catch {
        // silent – user already reset the timer
      }
    } else {
      Alert.alert(
        'Resend Code',
        'Go back and sign in again to receive a new code.',
      );
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2}).+(@.+)/, '$1••••$2')
    : 'your email';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Top dark section */}
      <Animated.View style={[styles.topSection, { opacity: fadeAnim }]}>
        <Text style={styles.topTitle}>Verify</Text>
        <Text style={styles.topTitle}>Your Email</Text>
        <Text style={styles.topSub}>Code sent to {maskedEmail}</Text>
      </Animated.View>

      {/* White card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <Animated.View
          style={[styles.card, { transform: [{ translateY: cardAnim }] }]}
        >
          <View style={styles.cardContent}>
            {/* OTP inputs */}
            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={r => {
                    inputs.current[i] = r;
                  }}
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                  value={digit}
                  onChangeText={val => handleChange(val, i)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, i)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  caretHidden
                  selectTextOnFocus
                />
              ))}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Resend */}
            <TouchableOpacity
              onPress={handleResend}
              disabled={resendTimer > 0}
              style={styles.resendWrap}
            >
              <Text
                style={[
                  styles.resend,
                  resendTimer > 0 && styles.resendDisabled,
                ]}
              >
                {resendTimer > 0
                  ? `Resend code in ${resendTimer}s`
                  : 'Resend code'}
              </Text>
            </TouchableOpacity>

            {/* Verify button */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleVerify}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>VERIFY</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerSub}>Wrong email?</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.footerLink}> Go back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VerifyOtpScreen;

const BG = '#0D1A2D';
const CARD = '#FFFFFF';
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
  topTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 44,
  },
  topSub: { fontSize: 14, color: '#8890A8', marginTop: 10 },

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

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderBottomWidth: 2,
    borderBottomColor: DIVIDER,
    fontSize: 22,
    fontWeight: '700',
    color: BG,
  },
  otpBoxFilled: { borderBottomColor: BG },

  errorText: {
    fontSize: 13,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 12,
  },

  resendWrap: { alignSelf: 'center', marginBottom: 32 },
  resend: { fontSize: 14, color: BG, fontWeight: '600' },
  resendDisabled: { color: '#BBBBBB' },

  btn: {
    backgroundColor: BG,
    borderRadius: 30,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
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
