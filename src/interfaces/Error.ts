export interface AuthState {
  user: unknown | null;
  token: string;
  error: string | null;
}
