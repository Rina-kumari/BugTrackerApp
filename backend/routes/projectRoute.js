import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { projectSchema } from "../libs/validateSchema.js";
import authMiddleware from "../middleware/auth-middleware.js";
import { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectTasks,getProjectStats,getAllProjectsStats} from '../controllers/projectController.js';

const router = express.Router();

router.post("/", authMiddleware, validateRequest({ body: projectSchema }), createProject);
router.get("/", authMiddleware, getProjects);
router.get("/stats/all", authMiddleware, getAllProjectsStats);
router.get("/:id/tasks", authMiddleware, validateRequest({ params: z.object({ id: z.string() }) }), getProjectTasks);
router.get("/:id/stats", authMiddleware, validateRequest({ params: z.object({ id: z.string() }) }), getProjectStats);


router.get("/:id", authMiddleware, getProjectById);

router.put("/:id", authMiddleware, validateRequest({ body: projectSchema }), updateProject);
router.delete("/:id", authMiddleware, deleteProject);

export default router;