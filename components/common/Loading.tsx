import React from 'react';

export const Loading: React.FC = () => {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-10 space-y-4">
            <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Carregando...</p>
        </div>
    );
};
