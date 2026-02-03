import express from 'express';
import { getAllUsers } from '../controllers/authController.js';
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/",authMiddleware, getAllUsers);

export default router;