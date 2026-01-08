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
        let retidos = 0;

        const activeStudents = studentsOfYear.filter(s => ['cursando', 'ativo'].includes(normalize(s.status || 'cursando')));

        activeStudents.forEach(student => {
            const studentClass = classesOfYear.find(c => String(c.id) === String(student.classId));
            const config = data.academicYears.find(y => y.year === filterYear);
            const now = new Date();

            if (!studentClass || !studentClass.subjectIds || studentClass.subjectIds.length === 0) {
                emCurso++;
                return;
            }

            const subjectsInClass = data.subjects.filter(s => studentClass.subjectIds?.includes(s.id));

            let studentFinalStatus = "Aprovado"; // Assume aprovado até provar o contrário
            let isPendingByDeadlines = false;
            let isFailedByDeadlines = false;
            let isAtRecovery = false;

            subjectsInClass.forEach(sub => {
                const grades = data.grades.filter(g => g.studentId === student.id && g.subjectId === sub.id);
                const bims = [1, 2, 3, 4].map(t => grades.find(g => g.term === t)?.value);
                const rf = grades.find(g => g.term === 5)?.value;
                const validBims = bims.filter(v => v !== undefined && v !== null) as number[];

                const b1End = config?.b1End ? new Date(config.b1End + 'T23:59:59') : null;
                const b2End = config?.b2End ? new Date(config.b2End + 'T23:59:59') : null;
                const b3End = config?.b3End ? new Date(config.b3End + 'T23:59:59') : null;
                const b4End = config?.b4End ? new Date(config.b4End + 'T23:59:59') : null;
                const recEnd = config?.recEnd ? new Date(config.recEnd + 'T23:59:59') : null;

                // Lógica de Pendência
                const isPendingSub = (b1End && now > b1End && bims[0] === undefined) ||
                    (b2End && now > b2End && bims[1] === undefined) ||
                    (b3End && now > b3End && bims[2] === undefined) ||
                    (b4End && now > b4End && bims[3] === undefined);

                if (isPendingSub) isPendingByDeadlines = true;

                // Lógica de Retenção e Recuperação
                if (validBims.length === 4) {
                    const points = validBims.reduce((a, b) => a + b, 0);
                    const mg = points / 4;
                    if (mg < 6) {
                        if (rf !== undefined && rf !== null) {
                            const mf = (mg * 6 + rf * 4) / 10;
                            if (mf < 5.0) isFailedByDeadlines = true;
                        } else if (recEnd && now > recEnd) {
                            isFailedByDeadlines = true;
                        } else {
                            isAtRecovery = true;
                        }
                    }
                } else if (b4End && now > b4End) {
                    isFailedByDeadlines = true;
                }
            });

            if (isFailedByDeadlines) retidos++;
            else if (isAtRecovery) recuperacao++;
            else if (isPendingByDeadlines) emCurso++;
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
            academic: { aprovados, recuperacao, emCurso, retidos },
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
