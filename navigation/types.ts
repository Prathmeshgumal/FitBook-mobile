import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ── Auth stack ────────────────────────────────────────────────
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { email: string; flow: 'signup' | 'forgotPassword' };
  ResetPassword: { email: string; resetToken: string };
};

// ── Onboarding stack ──────────────────────────────────────────
export type OnboardingStackParamList = {
  GymSetup: undefined;
  AddPlans: { gymId: number };
  AddBatches: { gymId: number };
  SetupComplete: undefined;
};

// ── Main tab navigator ────────────────────────────────────────
export type MainTabParamList = {
  Members: undefined;
  Dashboard: undefined;
  Settings: undefined;
};

// ── Members stack (nested inside Members tab) ─────────────────
export type MembersStackParamList = {
  MembersList: undefined;
  MemberDetail: { memberId: number };
  AddMemberStep1: undefined;
  AddMemberStep2: { memberId: number };
};

// ── Screen prop types ─────────────────────────────────────────

// Auth
export type SplashScreenProps = NativeStackScreenProps<AuthStackParamList, 'Splash'>;
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Signup'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;
export type VerifyOtpScreenProps = NativeStackScreenProps<AuthStackParamList, 'VerifyOtp'>;
export type ResetPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

// Onboarding
export type GymSetupScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'GymSetup'>;
export type AddPlansScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'AddPlans'>;
export type AddBatchesScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'AddBatches'>;
export type SetupCompleteScreenProps = NativeStackScreenProps<OnboardingStackParamList, 'SetupComplete'>;

// Members stack
export type MembersListScreenProps = NativeStackScreenProps<MembersStackParamList, 'MembersList'>;
export type MemberDetailScreenProps = NativeStackScreenProps<MembersStackParamList, 'MemberDetail'>;
export type AddMemberStep1ScreenProps = NativeStackScreenProps<MembersStackParamList, 'AddMemberStep1'>;
export type AddMemberStep2ScreenProps = NativeStackScreenProps<MembersStackParamList, 'AddMemberStep2'>;

// Legacy alias (kept for any imports still using RootStackParamList)
export type RootStackParamList = AuthStackParamList;
export type ComingSoonScreenProps = NativeStackScreenProps<AuthStackParamList, 'Splash'>;
