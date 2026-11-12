export type UserRole = "MANAGER" | "DIRECTOR";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}
