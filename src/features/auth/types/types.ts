export type ProgileData = {
  id: string;
  user_id: string;
  role_name: string;
  email: string;
  name: string;
  full_name: string;
};
export type UserData = {
  email: string;
  name: string;
  full_name: string;
};
export type LoginData = {
  email: string;
  password: string;
};
export type Role = "superAdmin" | "admin" | "user" | "unauthenticated" | "";
