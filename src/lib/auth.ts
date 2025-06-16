import type { User } from '@/types';

const MOCK_USER_KEY = 'banker_ai_mock_user';

// Mock credentials
const VALID_USERNAME = 'rm_user';
const VALID_PASSWORD = 'password123';

export function login(username: string, password_DO_NOT_USE_IN_PROD: string): Promise<User | null> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === VALID_USERNAME && password_DO_NOT_USE_IN_PROD === VALID_PASSWORD) {
        const user: User = { id: 'user-123', username };
        if (typeof window !== 'undefined') {
          localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
        }
        resolve(user);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
}

export function logout(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(MOCK_USER_KEY);
    }
    resolve();
  });
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const userStr = localStorage.getItem(MOCK_USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr) as User;
    } catch (e) {
      localStorage.removeItem(MOCK_USER_KEY); // Clear corrupted data
      return null;
    }
  }
  return null;
}
