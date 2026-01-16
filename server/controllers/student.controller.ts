import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class StudentController {

    async getAll(req: Request, res: Response) {
        try {
            const students = await prisma.student.findMany();
            return res.json(students);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch students' });
        }
    }

    async getOne(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const student = await prisma.student.findUnique({ where: { id: id as string } });
            if (!student) return res.status(404).json({ error: 'Student not found' });
            return res.json(student);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch student' });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const student = await prisma.student.create({ data: req.body });
            return res.status(201).json(student);
        } catch (error) {
            console.error("[StudentController] Create Error:", error);
            return res.status(500).json({ error: 'Failed to create student' });
        }
    }

    async update(req: Request, res: Response) {
        const { id } = req.params;
        try {
            const student = await prisma.student.update({ where: { id: id as string }, data: req.body });
            return res.json(student);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to update student' });
        }
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        try {
            // Software Cascade Delete: Delete related grades first
            await prisma.grade.deleteMany({
                where: { studentId: id as string }
            });

            // Then delete the student
            await prisma.student.delete({ where: { id: id as string } });

            return res.sendStatus(204);
        } catch (error) {
            console.error("[StudentController] Delete Error:", error);
            return res.status(500).json({ error: 'Failed to delete student' });
        }
    }
}
