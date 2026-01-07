import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { Icons } from '../components/common/Icons';
import { KPICard } from '../components/Dashboard/KPICard';
import { StatusMetric } from '../components/Dashboard/StatusMetric';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Dashboard: React.FC = () => {
  const { data } = useSchool();
  const [filterYear, setFilterYear] = useState('2026');

  // Custom hook for data processing
  const { stats, sortedClasses } = useDashboardStats(filterYear);

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-8 pb-20"
      variants={container}
      initial="hidden"
      animate="show"
    >

      {/* Header com Filtro de Ano */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0A1128] tracking-tight">Visão Geral</h1>
          <p className="text-slate-500 font-medium mt-1">Indicadores de desempenho e ocupação em tempo real.</p>
        </div>
        <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-5 py-2.5 shadow-sm hover:shadow-md transition-shadow">
          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mr-4">Filtrar Ano</span>
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="bg-transparent outline-none text-slate-800 font-black text-sm cursor-pointer"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </motion.div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={item} className="contents">
          <KPICard
            title="Total Protagonistas"
            value={stats.totalStudents}
            icon={<Icons.Users />}
            colorBg="bg-blue-50"
            colorText="text-blue-600"
          />
        </motion.div>
        <motion.div variants={item} className="contents">
          <KPICard
            title="Média Global"
            value={stats.globalAverage.toFixed(1)}
            icon={<Icons.TrendUp />}
            colorBg={stats.globalAverage >= 6 ? "bg-emerald-50" : "bg-amber-50"}
            colorText={stats.globalAverage >= 6 ? "text-emerald-600" : "text-amber-600"}
          />
        </motion.div>
        <motion.div variants={item} className="contents">
          <KPICard
            title="Turmas Ativas"
            value={stats.activeClassesCount}
            icon={<Icons.School />}
            colorBg="bg-purple-50"
            colorText="text-purple-600"
          />
        </motion.div>
        <motion.div variants={item} className="contents">
          <KPICard
            title="Disciplinas"
            value={stats.activeSubjectsCount}
            icon={<Icons.Book />}
            colorBg="bg-indigo-50"
            colorText="text-indigo-600"
          />
        </motion.div>
      </div>

      {/* Seção Principal de Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Coluna Esquerda: Status e Acadêmico */}
        <div className="lg:col-span-8 space-y-8">

          {/* Status Card */}
          <motion.div variants={item} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-500">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-800"></div>
              Situação Cadastral ({filterYear})
            </h3>
            <div className="flex flex-col sm:flex-row gap-6">
              <StatusMetric
                label="Cursando"
                count={stats.statusCounts.cursando}
                total={stats.totalStudents}
                bgClass="border-emerald-100 bg-emerald-50/30"
                colorClass="text-emerald-600"
              />
              <StatusMetric
                label="Transferidos"
                count={stats.statusCounts.transferidos}
                total={stats.totalStudents}
                bgClass="border-blue-100 bg-blue-50/30"
                colorClass="text-blue-600"
              />
              <StatusMetric
                label="Evadidos"
                count={stats.statusCounts.evadidos}
                total={stats.totalStudents}
                bgClass="border-red-100 bg-red-50/30"
                colorClass="text-red-600"
              />
            </div>
          </motion.div>

          {/* Academic Performance Card */}
          <motion.div variants={item} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow duration-500">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Icons.TrendUp />
            </div>
            <div className="flex justify-between items-end mb-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                Desempenho Acadêmico ({filterYear})
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-50 px-2 py-1 rounded">Critério: Soma ≥ 24</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col justify-center items-center text-center">
                <span className="text-3xl font-black text-emerald-600">{stats.academic.aprovados}</span>
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">Aprovados</span>
              </div>
              <div className="p-5 rounded-2xl bg-red-50 border border-red-100 flex flex-col justify-center items-center text-center">
                <span className="text-3xl font-black text-red-600">{stats.academic.recuperacao}</span>
                <span className="text-[10px] font-black text-red-800 uppercase tracking-widest mt-1">Recuperação</span>
              </div>
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col justify-center items-center text-center">
                <span className="text-3xl font-black text-amber-600">{stats.academic.emCurso}</span>
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest mt-1">Em Curso</span>
              </div>
            </div>
            <div className="mt-6 flex items-start gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-400 mt-0.5"><Icons.Alert /></div>
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong>Nota:</strong> Os dados referem-se ao ano letivo selecionado. Alunos "Em Curso" possuem diários incompletos ou em andamento.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Coluna Direita: Ocupação */}
        <motion.div variants={item} className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm h-full flex flex-col max-h-[720px] hover:shadow-md transition-shadow duration-500">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-6">Ocupação por Turma ({filterYear})</h3>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {sortedClasses.length === 0 && (
                <div className="text-center py-24 text-slate-400 text-sm italic flex flex-col items-center">
                  <span className="text-4xl mb-3 opacity-20">🏫</span>
                  Nenhuma turma registrada em {filterYear}.
                </div>
              )}

              {sortedClasses.map(cls => {
                const count = data.students.filter(s => String(s.classId) === String(cls.id)).length;
                // Encontrar a maior turma para referência relativa (visualização de distribuição)
                const maxStudentsInAnyClass = Math.max(...sortedClasses.map(c =>
                  data.students.filter(s => String(s.classId) === String(c.id)).length
                ), 1); // Evitar divisão por zero

                // Percentual relativo à maior turma (melhor para visualização de densidade)
                const relativePercentage = (count / maxStudentsInAnyClass) * 100;

                return (
                  <div key={cls.id} className="group cursor-default border-b border-slate-50 pb-4 last:border-0">
                    <div className="flex justify-between items-end mb-2.5">
                      <div>
                        <span className="block text-xs font-black text-slate-700 uppercase tracking-tight">{cls.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cls.enrollmentType || 'Regular'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{count}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase ml-2">Protagonistas</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000 group-hover:bg-indigo-600"
                        style={{ width: `${Math.max(5, relativePercentage)}%` }} // Mínimo de 5% para visibilidade
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-8 mt-6 border-t border-slate-100 text-center">
              <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em]">
                Total de {sortedClasses.length} turmas listadas
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
