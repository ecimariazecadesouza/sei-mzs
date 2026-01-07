import { useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';

export const useDashboardStats = (filterYear: string) => {
    const { data } = useSchool();

    const stats = useMemo(() => {
        // Filtrar turmas pelo ano selecionado
        const classesOfYear = data.classes.filter(c => c.year === filterYear);
        const classIdsOfYear = new Set(classesOfYear.map(c => String(c.id)));

        // Filtrar alunos que pertencem às turmas desse ano
        const studentsOfYear = data.students.filter(s => classIdsOfYear.has(String(s.classId)));
        const totalStudents = studentsOfYear.length;
        const normalize = (s: string) => s ? s.toLowerCase().trim() : '';

        const statusCounts = {
            cursando: studentsOfYear.filter(s => ['cursando', 'ativo'].includes(normalize(s.status || 'cursando'))).length,
            transferidos: studentsOfYear.filter(s => normalize(s.status).includes('transfer')).length,
            evadidos: studentsOfYear.filter(s => normalize(s.status).includes('eva')).length,
        };

        let aprovados = 0;
        let recuperacao = 0;
        let emCurso = 0;

        const activeStudents = studentsOfYear.filter(s => ['cursando', 'ativo'].includes(normalize(s.status || 'cursando')));

        activeStudents.forEach(student => {
            const studentClass = classesOfYear.find(c => String(c.id) === String(student.classId));
            if (!studentClass || !studentClass.subjectIds || studentClass.subjectIds.length === 0) {
                emCurso++;
                return;
            }

            const subjectsInClass = data.subjects.filter(s => studentClass.subjectIds?.includes(s.id));
            let isFailingAny = false;
            let isPendingAny = false;

            subjectsInClass.forEach(sub => {
                const grades = data.grades.filter(g => g.studentId === student.id && g.subjectId === sub.id);
                const bims = [1, 2, 3, 4].map(t => grades.find(g => g.term === t)?.value);
                const validBims = bims.filter(v => v !== undefined && v !== null) as number[];

                if (validBims.length < 4) {
                    isPendingAny = true;
                } else {
                    const sum = validBims.reduce((a, b) => a + b, 0);
                    if (sum < 24) isFailingAny = true;
                }
            });

            if (isPendingAny) emCurso++;
            else if (isFailingAny) recuperacao++;
            else aprovados++;
        });

        const studentIdsOfYear = new Set(studentsOfYear.map(s => s.id));
        const gradesOfYear = data.grades.filter(g => studentIdsOfYear.has(g.studentId));
        const allGradeValues = gradesOfYear.map(g => g.value).filter(v => v !== null);

        const globalAverage = allGradeValues.length > 0
            ? (allGradeValues.reduce((a, b) => a + b, 0) / allGradeValues.length)
            : 0;

        return {
            totalStudents,
            statusCounts,
            academic: { aprovados, recuperacao, emCurso },
            globalAverage,
            activeClassesCount: classesOfYear.length,
            activeSubjectsCount: data.subjects.filter(s => String(s.year) === filterYear).length
        };
    }, [data, filterYear]);

    const sortedClasses = useMemo(() => {
        return data.classes
            .filter(c => c.year === filterYear)
            .sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
            );
    }, [data.classes, filterYear]);

    return { stats, sortedClasses };
};
