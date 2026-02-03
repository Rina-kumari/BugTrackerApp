import express from "express";

import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { taskSchema } from "../libs/validateSchema.js";
import {createTask, getTaskById, updateTaskTitle, updateTaskDescription, updateTaskStatus,updateTaskAssignees, updateTaskPriority, addSubTask,updateSubTask,getActivityByResourceId,addComment,getCommentsByTaskId,deleteTask} from "../controllers/taskController.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

router.post("/:projectId/create-task",authMiddleware,validateRequest({params: z.object({projectId: z.string(),}),body: taskSchema}),createTask);
router.delete("/:taskId",authMiddleware,validateRequest({params: z.object({ taskId: z.string() }),}),deleteTask);

router.post("/:taskId/add-subtask",authMiddleware,validateRequest({params: z.object({taskId: z.string(),}),body: z.object({title: z.string().min(1, "Subtask title is required"),}),}),addSubTask);

router.post("/:taskId/add-comment",authMiddleware,validateRequest({params: z.object({ taskId: z.string() }),body: z.object({ text: z.string().min(1, "Comment text is required") }),}),addComment);
router.get("/:taskId/comments",authMiddleware,validateRequest({params: z.object({ taskId: z.string() }),}),getCommentsByTaskId);
router.put("/:taskId/update-subtask/:subTaskId",authMiddleware,validateRequest({params: z.object({taskId: z.string(),subTaskId: z.string(),}),body: z.object({completed: z.boolean(),}),}),updateSubTask);


router.get("/:taskId", authMiddleware, validateRequest({params:z.object({taskId:z.string(),}),}),getTaskById);

router.get("/:resourceId/activity", authMiddleware, validateRequest({params: z.object({resourceId: z.string(),}),}), getActivityByResourceId);

router.put("/:taskId/title",authMiddleware, validateRequest({params:z.object({taskId:z.string(),}),}),updateTaskTitle);
router.put("/:taskId/description",authMiddleware, validateRequest({params:z.object({taskId:z.string(),}),}),updateTaskDescription);
router.put("/:taskId/status",authMiddleware, validateRequest({params:z.object({taskId:z.string(),}),}),updateTaskStatus);
router.put("/:taskId/assignees",authMiddleware, validateRequest({params:z.object({taskId:z.string(),}),}),updateTaskAssignees);
router.put("/:taskId/priority",authMiddleware, validateRequest({params:z.object({taskId:z.string(),}),}),updateTaskPriority);


export default router;