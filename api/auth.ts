import { rawPost, authFetch, TokenStore } from './client';

// ── Request types ──────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

// ── Onboarder OTP ──────────────────────────────────────────
export async function requestOnboarderOtp(
  email: string,
): Promise<{ message: string }> {
  return rawPost('/auth/signup/request-onboarder-otp', { email });
}

// ── Signup ─────────────────────────────────────────────────
export async function register(payload: {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  onboarder_otp: string;
}): Promise<{ message: string }> {
  return rawPost('/auth/signup/register', payload);
}

export async function verifySignupEmail(
  email: string,
  otp: string,
): Promise<TokenResponse> {
  const tokens = await rawPost<TokenResponse>('/auth/signup/verify-email', {
    email,
    otp,
  });
  await TokenStore.save(tokens.access_token, tokens.refresh_token);
  return tokens;
}

// ── Login ──────────────────────────────────────────────────
export async function login(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const tokens = await rawPost<TokenResponse>('/auth/login', {
    email,
    password,
  });
  await TokenStore.save(tokens.access_token, tokens.refresh_token);
  return tokens;
}

// ── Logout ─────────────────────────────────────────────────
export async function logout(refreshToken: string): Promise<void> {
  await authFetch('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  await TokenStore.clear();
}

// ── Forgot password ────────────────────────────────────────
export async function requestForgotPasswordOtp(
  email: string,
): Promise<{ message: string }> {
  return rawPost('/auth/forgot-password/request', { email });
}

export async function verifyForgotPasswordOtp(
  email: string,
  otp: string,
): Promise<{ reset_token: string }> {
  return rawPost('/auth/forgot-password/verify-otp', { email, otp });
}

export async function resetPassword(
  resetToken: string,
  newPassword: string,
): Promise<{ message: string }> {
  return rawPost('/auth/forgot-password/reset', {
    reset_token: resetToken,
    new_password: newPassword,
  });
}
