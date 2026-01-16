import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class GradeController {

    async getAll(req: Request, res: Response) {
        try {
            const grades = await prisma.grade.findMany();
            return res.json(grades);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch grades' });
        }
    }

    async getOne(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const grade = await prisma.grade.findUnique({ where: { id: id as string } });
            if (!grade) return res.status(404).json({ error: 'Grade not found' });
            return res.json(grade);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch grade' });
        }
    }

    async create(req: Request, res: Response) {
        // This acts as an UPSERT via POST /grades
        try {
            const { studentId, subjectId, term, value } = req.body;

            // Check if exists
            const existing = await prisma.grade.findFirst({
                where: {
                    studentId,
                    subjectId,
                    term: Number(term)
                }
            });

            let grade;
            if (existing) {
                grade = await prisma.grade.update({
                    where: { id: existing.id },
                    data: { value: Number(value) }
                });
            } else {
                grade = await prisma.grade.create({
                    data: {
                        studentId,
                        subjectId,
                        term: Number(term),
                        value: Number(value)
                    }
                });
            }

            return res.status(200).json(grade);
        } catch (error) {
            console.error("[GradeController] Create/Upsert Error:", error);
            return res.status(500).json({ error: 'Failed to save grade' });
        }
    }

    async bulkUpdate(req: Request, res: Response) {
        try {
            const { grades } = req.body;
            if (!Array.isArray(grades)) {
                return res.status(400).json({ error: 'Invalid payload: grades must be an array' });
            }

            const results = [];

            // We iterate and upsert one by one. 
            // Prisma supports createMany but not "upsertMany" directly without raw SQL or a loop.
            // Given the typical class size (< 50 students * 1 term), a loop is acceptable.

            for (const g of grades) {
                const { studentId, subjectId, term, value } = g;

                // Skip invalid entries
                if (!studentId || !subjectId || term === undefined || value === undefined) continue;

                const existing = await prisma.grade.findFirst({
                    where: {
                        studentId,
                        subjectId,
                        term: Number(term)
                    }
                });

                if (existing) {
                    results.push(await prisma.grade.update({
                        where: { id: existing.id },
                        data: { value: Number(value) }
                    }));
                } else {
                    results.push(await prisma.grade.create({
                        data: {
                            studentId,
                            subjectId,
                            term: Number(term),
                            value: Number(value)
                        }
                    }));
                }
            }

            return res.json({ message: 'Grades processed', count: results.length });
        } catch (error) {
            console.error("[GradeController] Bulk Update Error:", error);
            return res.status(500).json({ error: 'Failed to process bulk grades' });
        }
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const grade = await prisma.grade.update({ where: { id: id as string }, data: req.body });
            return res.json(grade);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update grade' });
        }
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await prisma.grade.delete({ where: { id: id as string } });
            return res.sendStatus(204);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to delete grade' });
        }
    }
}
