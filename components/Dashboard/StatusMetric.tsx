import React from 'react';

interface StatusMetricProps {
    label: string;
    count: number;
    total: number;
    colorClass: string;
    bgClass: string;
}

export const StatusMetric: React.FC<StatusMetricProps> = ({ label, count, total, colorClass, bgClass }) => {
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className={`flex-1 p-6 rounded-3xl border ${bgClass} text-center transition-all hover:scale-[1.02]`}>
            <div className={`text-4xl font-black ${colorClass} mb-1`}>{count}</div>
            <div className={`text-xs font-bold ${colorClass} opacity-80 uppercase tracking-wide`}>{label}</div>
            <div className="text-[9px] font-bold text-slate-400/80 uppercase tracking-widest mt-2">{percent}% do total</div>
        </div>
    );
};
