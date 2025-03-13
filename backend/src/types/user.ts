export interface User {
  userId: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
} 