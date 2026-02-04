import { z } from "zod";

export const PROJECT_ROLES = ["admin", "manager", "member", "developer", "qa"] as const;

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(10, "Password must be at least 10 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  role: z.enum(PROJECT_ROLES),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  members: z.array(z.object({ userId: z.number(), role: z.enum(PROJECT_ROLES), }), ).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Testing", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignees: z.array(z.number()).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address").toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

  export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").trim(),
});

export const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
