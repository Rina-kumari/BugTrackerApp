import { postData } from "@/lib/fetchUtils";
import type { SignupFormData } from "@/routes/auth/signUp";
import { useMutation } from "@tanstack/react-query";

export const useSignUpMutation = () => {
  return useMutation({
    mutationFn: (data: SignupFormData) => postData("/auth/register", data),
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      postData("/auth/login", data),
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      postData("/auth/forgot-password", data),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      postData("/auth/reset-password", data),
  });
};