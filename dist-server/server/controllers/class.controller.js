import { prisma } from '../lib/prisma';
export class ClassController {
    async getAll(req, res) {
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
            const formattedClasses = classes.map((c) => ({
                ...c,
                subjectIds: c.subjects ? c.subjects.map((s) => s.id) : []
            }));
            return res.json(formattedClasses);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to fetch classes' });
        }
    }
    async getOne(req, res) {
        const { id } = req.params;
        try {
            const cls = await prisma.class.findUnique({
                where: { id: id },
                include: { subjects: true }
            });
            if (!cls)
                return res.status(404).json({ error: 'Class not found' });
            const formattedClass = {
                ...cls,
                subjectIds: cls.subjects.map((s) => s.id)
            };
            return res.json(formattedClass);
        }
        catch (error) {
            return res.status(500).json({ error: 'Failed to fetch class' });
        }
    }
    async create(req, res) {
        try {
            const { subjectIds, ...data } = req.body;
            // Prepare the create payload
            const createData = { ...data };
            if (subjectIds && Array.isArray(subjectIds)) {
                createData.subjects = {
                    connect: subjectIds.map((id) => ({ id }))
                };
            }
            const newClass = await prisma.class.create({
                data: createData,
                include: { subjects: true }
            });
            const formattedClass = {
                ...newClass,
                subjectIds: newClass.subjects.map((s) => s.id)
            };
            return res.status(201).json(formattedClass);
        }
        catch (error) {
            console.error("[ClassController] Create Error:", error);
            return res.status(500).json({ error: 'Failed to create class' });
        }
    }
    async update(req, res) {
        const { id } = req.params;
        try {
            const { subjectIds, ...data } = req.body;
            const updateData = { ...data };
            if (subjectIds && Array.isArray(subjectIds)) {
                // Use 'set' to replace all existing relations with the new list
                updateData.subjects = {
                    set: subjectIds.map((id) => ({ id }))
                };
            }
            const updatedClass = await prisma.class.update({
                where: { id: id },
                data: updateData,
                include: { subjects: true }
            });
            const formattedClass = {
                ...updatedClass,
                subjectIds: updatedClass.subjects.map((s) => s.id)
            };
            return res.json(formattedClass);
        }
        catch (error) {
            console.error("[ClassController] Update Error:", error);
            return res.status(500).json({ error: 'Failed to update class' });
        }
    }
    async delete(req, res) {
        const { id } = req.params;
        try {
            await prisma.class.delete({ where: { id: id } });
            return res.sendStatus(204);
        }
        catch (error) {
            return res.status(500).json({ error: 'Failed to delete class' });
        }
    }
}
