import { Router } from 'express';
import { GradeController } from '../controllers/grade.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const controller = new GradeController();

router.use(authMiddleware);

router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getOne(req, res));
router.post('/', (req, res) => controller.create(req, res)); // Handles upsert logic
router.post('/bulk', (req, res) => controller.bulkUpdate(req, res)); // Handles array of upserts
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
