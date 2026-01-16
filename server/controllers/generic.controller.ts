import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class GenericController {
    private model: any;

    constructor(modelName: string) {
        this.model = (prisma as any)[modelName];
    }

    async getAll(req: Request, res: Response) {
        try {
            const items = await this.model.findMany();
            return res.json(items);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch items' });
        }
    }

    async getOne(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const item = await this.model.findUnique({ where: { id } });
            if (!item) return res.status(404).json({ error: 'Item not found' });
            return res.json(item);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch item' });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const item = await this.model.create({ data: req.body });
            return res.status(201).json(item);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to create item' });
        }
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const item = await this.model.update({ where: { id }, data: req.body });
            return res.json(item);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update item' });
        }
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await this.model.delete({ where: { id } });
            return res.sendStatus(204);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete item' });
        }
    }
}
