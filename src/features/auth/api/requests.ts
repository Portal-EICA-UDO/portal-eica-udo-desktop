import { supabase } from "@shared/api";
import type { LoginData, UserData } from "../types";

export const loginRequest = async (loginData: LoginData) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginData.email,
    password: loginData.password,
  });
  if (error) {
    throw new Error();
  }
  return data;
};

export const signUpRequest = async (
  loginData: LoginData,
  userData?: UserData,
) => {
  const { data, error } = await supabase.auth.signUp({
    email: loginData.email,
    password: loginData.password,
    options: {
      data: userData,
    },
  });
  if (error) {
    throw new Error();
  }
  return data;
};
export const signUpWithOAuthRequest = async (provider: "google") => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
  });
  if (error) {
    throw new Error();
  }
  return data;
};

export const refreshRequest = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    throw new Error();
  }
  return data;
};

export const getSessionRequest = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error();
  }
  return data;
};

export const logoutRequest = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error();
  }
};

export const getProfileRequest = async (userID: string) => {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("user_id", userID);

  if (error) {
    throw new Error();
  }
  return data[0];
};
