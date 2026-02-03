import type { ProjectForm } from "@/components/project/createProject";
import type { Project, Task, User } from "@/types/indexTypes";
import { deleteData, fetchData, postData, updateData } from "@/lib/fetchUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
  const query = useQuery<User, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const user = await fetchData<User>("/auth/me");
        return user;
      } catch (error) {
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return query;
};


export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Project, Error, ProjectForm>({
    mutationFn: async (data: ProjectForm) => postData<Project>("/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Project, Error, { id: number; data: ProjectForm }>({
    mutationFn: async ({ id, data }) => updateData<Project>(`/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => deleteData<void>(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useGetProjectsQuery = () => {
  return useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: async () => fetchData<Project[]>("/projects"),
  });
};

export const useGetProjectQuery = (projectId: string, options?: { enabled?: boolean }) => {
  return useQuery<Project, Error>({
    queryKey: ["project", projectId],
    queryFn: async () => fetchData<Project>(`/projects/${projectId}`),
    enabled: options?.enabled ?? !!projectId,
  });
};

export const useProjectsQuery = (projectId: string) => {
  return useQuery<{ project: Project; tasks: Task[] }, Error>({
    queryKey: ["projects", projectId],
    queryFn: async () => fetchData<{ project: Project; tasks: Task[] }>(`/projects/${projectId}/tasks`),
  });
};

export const useGetUsersQuery = () => {
  return useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: async () => fetchData<User[]>("/users"),
  });
};

export const useGetProjectStatsQuery = (projectId: string | null) => {
  return useQuery({
    queryKey: ["projects", projectId || "all", "stats"],
    queryFn: async () => {
      if (projectId) {
        return fetchData(`/projects/${projectId}/stats`);
      } else {
        return fetchData(`/projects/stats/all`);
      }
    },
  });
};