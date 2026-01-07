import React from 'react';

interface KPICardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    colorBg: string;
    colorText: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon, colorBg, colorText }) => (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
                <h3 className="text-3xl font-black text-slate-800 mt-2 tracking-tight">{value}</h3>
            </div>
            <div className={`p-3 rounded-2xl ${colorBg} ${colorText} shadow-sm`}>
                {icon}
            </div>
        </div>
    </div>
);
