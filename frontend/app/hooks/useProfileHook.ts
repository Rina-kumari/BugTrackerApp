import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData, updateData } from "@/lib/fetchUtils";
import type { UpdateProfileRequest, UpdatePasswordRequest, User } from "@/types/indexTypes";

/**
 * Hook to fetch the current user's profile
 */
export const useProfileQuery = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchData<User>("/profile"),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
};

/**
 * Hook to update user profile (name)
 */
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      updateData<User>("/profile", data),
    onSuccess: (updatedUser, variables) => {
      console.log("Profile updated successfully:", updatedUser);
      
      // Update the profile cache
      queryClient.setQueryData(["profile"], updatedUser);
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
      
      // Also update any user-related caches that might exist
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
    onError: (error: any) => {
      console.error("Profile update error:", error);
    },
  });
};

/**
 * Hook to update user password
 */
export const useUpdatePasswordMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) =>
      updateData<{ message: string }>("/profile/password", data),
    onSuccess: (response) => {
      console.log("Password updated successfully:", response.message);
    },
    onError: (error: any) => {
      console.error("Password update error:", error);
    },
  });
};