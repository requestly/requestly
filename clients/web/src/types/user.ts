export interface User {
  photoURL: string;
  email: string;
  domain: string;
  isVerified: boolean;
  signupTs: number;
  username?: string;
  profile: Record<string, unknown>;
}
