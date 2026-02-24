export type UserStatus = 'allowed' | 'admin' | 'blacklisted';

export interface AuthUser {
  email: string;
  status: UserStatus;
  blacklistReason?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface CheckStatusResponse {
  status: UserStatus;
  reason?: string;
}
