import express from "express";
import { validateRequest } from "zod-express-middleware";
import { updateProfileSchema, updatePasswordSchema } from "../libs/validateSchema.js";
import { getProfile, updateProfile, updatePassword } from "../controllers/profileController.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProfile);

router.put('/', validateRequest({ body: updateProfileSchema }), updateProfile);

router.put('/password', validateRequest({ body: updatePasswordSchema }), updatePassword);

export default router;