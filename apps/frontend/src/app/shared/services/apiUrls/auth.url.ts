import { createUrl } from './base.url';

export const AuthUrls = {
  login: `${createUrl('auth/login')}`,
  register: `${createUrl('auth/register')}`,
  verifyOtp: `${createUrl('auth/verify-otp')}`,
  resendOtp: `${createUrl('auth/resend-otp')}`,
  googleUriRequest: `${createUrl('auth/google/uri')}`,
  googleSignIn: `${createUrl('auth/google/validate-token')}`,

  createAdmin: `${createUrl('user/create-admin-user')}`,


};
