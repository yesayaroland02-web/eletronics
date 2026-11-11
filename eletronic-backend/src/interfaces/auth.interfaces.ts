export interface RegisterInput {
  name?: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "ADMIN";
}

export interface LoginInput {
  email: string;
  password: string;
}