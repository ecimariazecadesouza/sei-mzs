import React from 'react';
import { useSchool } from '../../context/SchoolContext';

interface HeaderProps {
    onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    const { currentUser } = useSchool();
    const role = currentUser?.role || 'prof';

    // ... rest of roleLabels ...
    const roleLabels: Record<string, string> = {
        admin_ti: 'Admin TI',
        admin_dir: 'Direção',
        coord: 'Coordenação',
        sec: 'Secretaria',
        prof: 'Professor'
    };

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300">
            <div className="flex items-center space-x-4">
                <button
                    onClick={onToggleSidebar}
                    className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <span className="text-2xl">☰</span>
                </button>
                <h2 className="text-lg font-black text-[#0A1128] tracking-tight uppercase truncate">Painel de {roleLabels[role]}</h2>
            </div>
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-400 uppercase">
                        {role.substring(0, 3)}
                    </div>
                </div>
            </div>
        </header>
    );
};
