import express from "express";
import { validateRequest } from "zod-express-middleware";
import { loginSchema, registerSchema,forgotPasswordSchema,resetPasswordSchema } from "../libs/validateSchema.js";
import { loginUser, registerUser, getCurrentUser,forgotPassword,resetPassword} from "../controllers/authController.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

router.post("/register",validateRequest({body: registerSchema}),registerUser);

router.post("/login",validateRequest({body: loginSchema,}),loginUser);
router.post("/forgot-password", validateRequest({ body: forgotPasswordSchema }), forgotPassword);
router.post("/reset-password", validateRequest({ body: resetPasswordSchema }), resetPassword);


router.get('/me', authMiddleware, getCurrentUser);


export default router;