import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

router.get('/setup-status', authController.setupStatus);
router.post('/setup-admin', authController.setupAdmin);
router.post('/register', authMiddleware, authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);

export default router;
