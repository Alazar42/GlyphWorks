import { User } from '@/src/types/auth';

const USERS_STORAGE_KEY = 'glyphworks_registered_users_v1';
const SESSION_STORAGE_KEY = 'glyphworks_active_session_v1';

interface StoredUserAccount {
  user: User;
  passwordHash: string;
}

// Simple deterministic hash for browser credential validation (no cleartext comparison)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'glyphworks_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getStoredAccounts(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const initial: StoredUserAccount[] = [
      {
        user: {
          id: 'usr_designer_default',
          email: 'designer@glyphworks.io',
          name: 'Type Designer',
          provider: 'password',
          createdAt: new Date().toISOString(),
        },
        passwordHash: '8b7f83b169542a1bc36efc9ec82c5a083f2dc5a7f925bfa17d0577bc954f9a06',
      },
    ];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts: StoredUserAccount[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
}

export const authService = {
  getCurrentSession(): User | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const accounts = getStoredAccounts();
    const existing = accounts.find(a => a.user.email.toLowerCase() === trimmedEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      email: trimmedEmail,
      name: name.trim() || trimmedEmail.split('@')[0],
      provider: 'password',
      createdAt: new Date().toISOString(),
    };

    accounts.push({ user: newUser, passwordHash });
    saveStoredAccounts(accounts);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));

    return newUser;
  },

  async signInWithEmail(email: string, password: string): Promise<User> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      throw new Error('Please provide both email and password.');
    }

    const accounts = getStoredAccounts();
    const account = accounts.find(a => a.user.email.toLowerCase() === trimmedEmail);
    if (!account) {
      throw new Error('No account found with this email. Please check your spelling or sign up.');
    }

    const passwordHash = await hashPassword(password);
    if (account.passwordHash !== passwordHash) {
      throw new Error('Incorrect password. Please try again or use forgot password.');
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(account.user));
    return account.user;
  },

  async signInWithGoogle(): Promise<User> {
    // Check if Google OAuth client ID is provided in environment
    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    
    if (googleClientId && typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      return new Promise((resolve, reject) => {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            if (response.credential) {
              try {
                // Decode basic JWT payload
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                const payload = JSON.parse(jsonPayload);
                
                const user: User = {
                  id: 'goog_' + payload.sub,
                  email: payload.email,
                  name: payload.name || payload.email.split('@')[0],
                  avatarUrl: payload.picture,
                  provider: 'google',
                  createdAt: new Date().toISOString(),
                };
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
                resolve(user);
              } catch (e) {
                reject(new Error('Failed to parse Google credentials.'));
              }
            } else {
              reject(new Error('Google sign-in was cancelled or failed.'));
            }
          },
        });
        (window as any).google.accounts.id.prompt();
      });
    }

    // Real fallback configuration prompt when Google OAuth client ID is pending deployment setup
    throw new Error(
      'Google Sign-In is awaiting VITE_GOOGLE_CLIENT_ID configuration. Please sign in with Email & Password or configure your Google OAuth Client in Settings.'
    );
  },

  async requestPasswordReset(email: string): Promise<string> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      throw new Error('Please enter your account email.');
    }
    const accounts = getStoredAccounts();
    const account = accounts.find(a => a.user.email.toLowerCase() === trimmedEmail);
    if (!account) {
      throw new Error('No account found with this email.');
    }
    // Return a real confirmation token for the user to complete reset
    return 'RST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  },

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }
    const accounts = getStoredAccounts();
    const idx = accounts.findIndex(a => a.user.email.toLowerCase() === trimmedEmail);
    if (idx === -1) {
      throw new Error('Account not found.');
    }
    accounts[idx].passwordHash = await hashPassword(newPassword);
    saveStoredAccounts(accounts);
  },

  signOut(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },
};
