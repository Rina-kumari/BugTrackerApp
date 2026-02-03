import { PROJECT_ROLES } from "@/lib/schema";

export type ProjectRole = typeof PROJECT_ROLES[number];

export interface User {
  id: number;
  email: string;
  name: string;
  role: ProjectRole; 
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface ProjectMember {
  user_id: number;
  name: string;
  email: string;
  role: ProjectRole; 
  joined_at?: Date;
}


export interface Project {
  id: number;
  title: string;
  description?: string;
  created_by: number; // User ID who created the project
  created_by_user?: {  // Creator information
    id: number;
    name: string;
    email: string;
    role: ProjectRole; 
  };
  members: ProjectMember[];
  tags?: string[];
  tasks?: Task[];
  created_at: Date;
  updated_at: Date;
}

export interface MemberProps {
  id: string;
  user: User;
  role: ProjectRole; 
  joined_at: Date;
}

export type TaskStatus = "To Do" | "In Progress" | "Testing" | "Done";
export type TaskPriority = "High" | "Medium" | "Low";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Task {
  subtasks: Subtask[];
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  project?: Project;
  project_id?: number;
  created_at?: Date;
  updated_at?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  due_date?: Date;
  dueDate?: Date;
  priority: TaskPriority;
  assignee?: User | string;
  created_by?: User | string;
   created_by_user?: {
    name: string;
    email?: string;
    role?: string;
  };
  assignees?: User[];
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  task_id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  uploaded_at: string;
}

// types/indexTypes.ts

// Update ActionType to match what backend sends
export type ActionType = 
  | "created_task"
  | "updated_task"
  | "deleted_task"
  | "created_subtask"
  | "updated_subtask"
  | "deleted_subtask"
  | "assigned_task"
  | "unassigned_task"
  | string; // Allow any string for flexibility

export type ResourceType = "Task" | "Project" | "Subtask" | string;

export interface ActivityLog {
  id: number;
  user_id: number;
  action: ActionType; // Now this matches
  entity_type: ResourceType;
  entity_id: number;
  description: string;
  metadata: {
    description: string;
  };
  created_at: string;
  user: {
    name: string;
  };
}

export interface Comment {
  id: number;
  text: string;
  task_id: number;
  author_id: number;
  mentions: any;
  reactions: any;
  attachments: any;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    name: string;
  };
  parentId?: string | number | null;
} 

export interface StatsCardProps {
  totalProjects: number;
  totalTasks: number;
  totalProjectInProgress: number;
  totalTaskCompleted: number;
  totalTaskToDo: number;
  totalTaskInProgress: number;
  totalTaskTesting: number;
  totalTaskDone: number;
}

export interface TaskTrendsData {
  name: string;
  done: number;
  testing: number;
  inProgress: number;
  todo: number;
}

export interface TaskPriorityData {
  name: string;
  value: number;
  color: string;
}

export interface taskStatusData {
  name: string;
  value: number;
  color: string;
}

export interface UpdateProfileRequest {
  name: string;
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
}


