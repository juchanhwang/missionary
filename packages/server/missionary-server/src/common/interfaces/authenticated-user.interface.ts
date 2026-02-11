export interface AuthenticatedUser {
  id: string;
  email: string | null;
  role: string;
  provider: string | null;
}
