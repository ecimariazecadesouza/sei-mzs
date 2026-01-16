import { Router } from 'express';
import authRoutes from './auth.routes';
import { createGenericRouter } from './generic.routes';
import classRoutes from './class.routes';
import gradeRoutes from './grade.routes';

const router = Router();

router.use('/auth', authRoutes);

// Generic Routes
router.use('/students', createGenericRouter('student'));
router.use('/teachers', createGenericRouter('teacher'));
router.use('/subjects', createGenericRouter('subject'));
router.use('/classes', classRoutes);
router.use('/assignments', createGenericRouter('assignment'));
router.use('/grades', gradeRoutes);
router.use('/formations', createGenericRouter('formationType')); // Check model name
router.use('/knowledge-areas', createGenericRouter('knowledgeArea'));
router.use('/sub-areas', createGenericRouter('subArea'));
router.use('/settings', createGenericRouter('schoolSettings'));
router.use('/academic-years', createGenericRouter('academicYearConfig'));
router.use('/users', createGenericRouter('user'));

export default router;
