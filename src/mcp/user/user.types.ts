export interface UserProfile {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string | null;
    title: string | null;
  };
  organization: { name: string };
}
