import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <section className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#fbfcfd]">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Layout;
