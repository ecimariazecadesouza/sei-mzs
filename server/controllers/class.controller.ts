import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class ClassController {

    async getAll(req: Request, res: Response) {
        try {
            // Include subjects to display them in the UI
            const classes = await prisma.class.findMany({
                include: {
                    subjects: true
                }
            });

            // Map to match the frontend expected format if needed, 
            // but frontend seems to check 'subjectIds' property or 'subjects' list.
            // Looking at Classes.tsx: cls.subjectIds?.includes...
            // So we should probably flatten the subjects to subjectIds for the frontend if it strictly expects that,
            // OR ensure the frontend uses the relation.
            // Let's check Classes.tsx again. It uses `cls.subjectIds`.
            // So we need to map the result.

            const formattedClasses = classes.map((c: any) => ({
                ...c,
                subjectIds: c.subjects ? c.subjects.map((s: any) => s.id) : []
            }));

            return res.json(formattedClasses);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch classes' });
        }
    }

    async getOne(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const cls = await prisma.class.findUnique({
                where: { id },
                include: { subjects: true }
            });
            if (!cls) return res.status(404).json({ error: 'Class not found' });

            const formattedClass = {
                ...cls,
                subjectIds: (cls as any).subjects.map((s: any) => s.id)
            };

            return res.json(formattedClass);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch class' });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const { subjectIds, ...data } = req.body;

            // Prepare the create payload
            const createData: any = { ...data };

            if (subjectIds && Array.isArray(subjectIds)) {
                createData.subjects = {
                    connect: (subjectIds as string[]).map((id: string) => ({ id }))
                };
            }

            const newClass = await prisma.class.create({
                data: createData,
                include: { subjects: true }
            });

            const formattedClass = {
                ...newClass,
                subjectIds: (newClass as any).subjects.map((s: any) => s.id)
            };

            return res.status(201).json(formattedClass);
        } catch (error) {
            console.error("[ClassController] Create Error:", error);
            return res.status(500).json({ error: 'Failed to create class' });
        }
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const { subjectIds, ...data } = req.body;

            const updateData: any = { ...data };

            if (subjectIds && Array.isArray(subjectIds)) {
                // Use 'set' to replace all existing relations with the new list
                updateData.subjects = {
                    set: (subjectIds as string[]).map((id: string) => ({ id }))
                };
            }

            const updatedClass = await prisma.class.update({
                where: { id },
                data: updateData,
                include: { subjects: true }
            });

            const formattedClass = {
                ...updatedClass,
                subjectIds: (updatedClass as any).subjects.map((s: any) => s.id)
            };

            return res.json(formattedClass);
        } catch (error) {
            console.error("[ClassController] Update Error:", error);
            return res.status(500).json({ error: 'Failed to update class' });
        }
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await prisma.class.delete({ where: { id } });
            return res.sendStatus(204);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete class' });
        }
    }
}
