import { apiClient } from './api';

export type LoginCredentials = Pick<SignupCredentials, 'email' | 'password'>;

export type SignupCredentials = Omit<User, 'role' | 'restaurantId'> & {
  password: string;
};

export interface User {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  telephone: string;
  restaurantId?: string;
}

class AuthService {
  private currentUser: User | null = null;

  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user !== null;
    } catch {
      return false;
    }
  }

  async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      const response = await apiClient.post('/auth/login', credentials);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      this.currentUser = await this.getCurrentUser();
      return this.currentUser;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async signup(credentials: SignupCredentials): Promise<void> {
    try {
      const response = await apiClient.post('/auth/signup', credentials);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await apiClient.delete('/auth/login');
      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      this.currentUser = null;
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error('Failed to logout');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // Return cached user if available
      if (this.currentUser) {
        return this.currentUser;
      }

      const response = await apiClient.get('/auth/me');
      if (!response.ok) {
        this.currentUser = null;
        return null;
      }

      const data = await response.json();
      this.currentUser = data.user;
      return this.currentUser;
    } catch (error) {
      console.error('Error getting user data:', error);
      this.currentUser = null;
      return null;
    }
  }

  private handleError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

export const authService = new AuthService();
