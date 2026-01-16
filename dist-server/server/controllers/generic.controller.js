import { prisma } from '../lib/prisma';
export class GenericController {
    model;
    constructor(modelName) {
        this.model = prisma[modelName];
        if (!this.model) {
            console.error(`[GenericController] MODEL NOT FOUND: ${modelName}. Check prisma client and model names.`);
        }
    }
    async getAll(req, res) {
        try {
            const items = await this.model.findMany();
            return res.json(items);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch items' });
        }
    }
    async getOne(req, res) {
        const { id } = req.params;
        try {
            const item = await this.model.findUnique({ where: { id } });
            if (!item)
                return res.status(404).json({ error: 'Item not found' });
            return res.json(item);
        }
        catch (error) {
            return res.status(500).json({ error: 'Failed to fetch item' });
        }
    }
    async create(req, res) {
        try {
            const item = await this.model.create({ data: req.body });
            return res.status(201).json(item);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to create item' });
        }
    }
    async update(req, res) {
        const { id } = req.params;
        try {
            const item = await this.model.update({ where: { id }, data: req.body });
            return res.json(item);
        }
        catch (error) {
            return res.status(500).json({ error: 'Failed to update item' });
        }
    }
    async delete(req, res) {
        const { id } = req.params;
        try {
            await this.model.delete({ where: { id } });
            return res.sendStatus(204);
        }
        catch (error) {
            return res.status(500).json({ error: 'Failed to delete item' });
        }
    }
}
