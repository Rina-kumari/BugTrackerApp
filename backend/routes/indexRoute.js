import express from 'express';
import authRoutes from './authRoute.js';
import projectRoutes from "./projectRoute.js"
import userRoutes from "./userRoute.js";
import taskRoutes from "./taskRoute.js";
import profileRoutes from "./profileRoute.js";
 
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/users", userRoutes);
router.use("/tasks",taskRoutes);
router.use("/profile", profileRoutes);

export default router;