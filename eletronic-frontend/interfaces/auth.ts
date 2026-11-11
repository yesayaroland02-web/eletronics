export interface AuthPayload {
  name?: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "ADMIN";
}

export interface User {
  id: string;
  name?: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface AuthResponse {
  message: string;
  data: {
    token?: string;
    user?: User;
  };
}