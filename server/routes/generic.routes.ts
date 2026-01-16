import { Router } from 'express';
import { GenericController } from '../controllers/generic.controller';
import { authMiddleware } from '../middleware/auth';

export const createGenericRouter = (modelName: string) => {
    const router = Router();
    const controller = new GenericController(modelName);

    router.use(authMiddleware); // Protect all routes

    router.get('/', (req, res) => controller.getAll(req, res));
    router.get('/:id', (req, res) => controller.getOne(req, res));
    router.post('/', (req, res) => controller.create(req, res));
    router.put('/:id', (req, res) => controller.update(req, res));
    router.delete('/:id', (req, res) => controller.delete(req, res));

    return router;
};
