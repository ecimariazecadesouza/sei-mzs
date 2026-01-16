import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const controller = new StudentController();

router.use(authMiddleware);

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getOne(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
