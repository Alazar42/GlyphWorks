export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'password' | 'google';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
