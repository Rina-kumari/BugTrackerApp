import type { CreateTaskFormData } from "@/components/task/createTask";
import { deleteData, fetchData, postData, updateData } from "@/lib/fetchUtils";
import type { TaskPriority, TaskStatus } from "@/types/indexTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { projectId: string; taskData: CreateTaskFormData }) =>
    postData(`/tasks/${data.projectId}/create-task`, data.taskData),
    onSuccess: (responseData: any, variables) => {
      const { projectId } = variables;
      
      queryClient.invalidateQueries({
      queryKey: ["projects", projectId],
      });
      queryClient.invalidateQueries({
      queryKey: ["project", projectId],
      });
    },
  });
};

export const useTaskByIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => fetchData(`/tasks/${taskId}`),
  });
};

export const useUpdateTaskTitleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
    updateData(`/tasks/${data.taskId}/title`, { title: data.title }),
    onSuccess: (data: any, variables) => {
    queryClient.invalidateQueries({
    queryKey: ["task", variables.taskId],
    });
    queryClient.invalidateQueries({
    queryKey: ["task-activity", variables.taskId],
    });
    },
  });
};

export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; status: TaskStatus; projectId?: string }) =>
    updateData(`/tasks/${data.taskId}/status`, { status: data.status }),
    onSuccess: (data: any, variables) => {
      
    let projectId = variables.projectId;
      if (!projectId) {
        const taskData = queryClient.getQueryData<any>(["task", variables.taskId]);
        projectId = taskData?.task?.project_id?.toString() || taskData?.project?.id?.toString();
      }
    
      queryClient.invalidateQueries({
      queryKey: ["task", variables.taskId],
      });
      queryClient.invalidateQueries({
      queryKey: ["task-activity", variables.taskId],
      });
    
      if (projectId) {
        queryClient.invalidateQueries({
        queryKey: ["projects", projectId],
        });
        queryClient.invalidateQueries({
        queryKey: ["project", projectId],
        });
      }
    },
  });
};
export const useUpdateTaskDescriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; description: string }) =>
      updateData(`/tasks/${data.taskId}/description`, {
        description: data.description,
      }),
    onSuccess: (data: any, variables) => {

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },
  });
};

export const useUpdateTaskAssigneesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      taskId: string;
      assignees: string[];
      projectId?: string;
    }) =>
      updateData(`/tasks/${data.taskId}/assignees`, {
        assignees: data.assignees,
      }),
    onSuccess: (data: any, variables) => {
  
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      if (variables.projectId) {
        queryClient.invalidateQueries({
          queryKey: ["project", variables.projectId],
        });
      }
    
      queryClient.refetchQueries({
        queryKey: ["task", variables.taskId],
      });
    },
  });
};
export const useUpdateTaskPriorityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; priority: TaskPriority }) =>
      updateData(`/tasks/${data.taskId}/priority`, { priority: data.priority }),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },
  });
};

export const useAddSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; title: string }) =>
      postData(`/tasks/${data.taskId}/add-subtask`, { title: data.title }),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },
  });
};

export const useUpdateSubTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      taskId: string;
      subTaskId: string;
      completed?: boolean;
      title?: string;
    }) => {
      const updatePayload: { completed?: boolean; title?: string } = {};
      if (data.completed !== undefined) {
        updatePayload.completed = data.completed;
      }
      if (data.title !== undefined) {
        updatePayload.title = data.title;
      }

      return updateData(
        `/tasks/${data.taskId}/update-subtask/${data.subTaskId}`,
        updatePayload
      );
    },
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },
  });
};


export const useAddCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { taskId: string; text: string }) =>
      postData(`/tasks/${data.taskId}/add-comment`, { text: data.text }),
    onSuccess: (data: any, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-activity", variables.taskId],
      });
    },
  });
};

export const useGetCommentsByTaskIdQuery = (taskId: string) => {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => fetchData(`/tasks/${taskId}/comments`),
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await deleteData<{
        message: string;
        taskId: string;
        projectId: number;
      }>(`/tasks/${taskId}`);
      return response;
    },
    onSuccess: (data, taskId) => {
      
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.removeQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task-activity', taskId] });
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: ['project-tasks', data.projectId.toString()] });
      }
    },
    onError: (error: any) => {
      console.error('Delete task error:', error);
    }
  });
};