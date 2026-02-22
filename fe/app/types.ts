import type { components } from "./generated/api";

export type Todo = components["schemas"]["Todo"];
export type AuthInput = components["schemas"]["AuthInput"];
export type RegistrationInput = components["schemas"]["RegistrationInput"];
export type PasswordResetRequestInput =
  components["schemas"]["PasswordResetRequestInput"];
export type PasswordResetInput = components["schemas"]["PasswordResetInput"];
export type AuthResponse = components["schemas"]["AuthResponse"];
export type MessageResponse = components["schemas"]["MessageResponse"];
