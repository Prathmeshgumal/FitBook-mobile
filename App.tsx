import React, {useState, useCallback, useEffect} from 'react';
import {BackHandler, View, ActivityIndicator, StyleSheet} from 'react-native';
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import VerifyOtpScreen from './screens/auth/VerifyOtpScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';
import ComingSoonScreen from './screens/ComingSoonScreen';
import {TokenStore} from './api/client';

type Screen =
  | 'login'
  | 'signup'
  | 'forgotPassword'
  | 'verifyOtp'
  | 'resetPassword'
  | 'comingSoon';

type HistoryEntry = {
  screen: Screen;
  params: Record<string, string>;
};

const App = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([
    {screen: 'login', params: {}},
  ]);
  const [bootstrapping, setBootstrapping] = useState(true);

  // On launch, check if a refresh token exists — if so, skip to comingSoon
  useEffect(() => {
    TokenStore.getRefresh().then(token => {
      if (token) {
        setHistory([{screen: 'comingSoon', params: {}}]);
      }
      setBootstrapping(false);
    });
  }, []);

  const current = history[history.length - 1];
  const {screen: currentScreen, params: navParams} = current;

  const navigate = useCallback(
    (screen: Screen, params?: Record<string, string>) => {
      setHistory(h => [...h, {screen, params: params ?? {}}]);
    },
    [],
  );

  const goBack = useCallback(() => {
    setHistory(h => (h.length > 1 ? h.slice(0, -1) : h));
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentScreen === 'comingSoon') return true;
      if (history.length > 1) {
        goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [history, goBack, currentScreen]);

  if (bootstrapping) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (currentScreen === 'comingSoon') {
    return <ComingSoonScreen />;
  }

  if (currentScreen === 'signup') {
    return (
      <SignupScreen
        onNavigate={(screen, params) => navigate(screen, params)}
      />
    );
  }

  if (currentScreen === 'forgotPassword') {
    return (
      <ForgotPasswordScreen
        onNavigate={(screen, params) => navigate(screen, params)}
      />
    );
  }

  if (currentScreen === 'verifyOtp') {
    const flow = (navParams.flow as 'signup' | 'forgotPassword') ?? 'signup';
    return (
      <VerifyOtpScreen
        email={navParams.email}
        flow={flow}
        onBack={goBack}
        onVerified={data => {
          if (flow === 'forgotPassword') {
            navigate('resetPassword', {
              email: navParams.email,
              resetToken: data?.reset_token ?? '',
            });
          } else {
            navigate('comingSoon');
          }
        }}
      />
    );
  }

  if (currentScreen === 'resetPassword') {
    return (
      <ResetPasswordScreen
        email={navParams.email}
        resetToken={navParams.resetToken}
        onNavigate={screen => navigate(screen)}
      />
    );
  }

  return (
    <LoginScreen
      onNavigate={(screen, params) => navigate(screen as any, params)}
    />
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#0D1A2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
