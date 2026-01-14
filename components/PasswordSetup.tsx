import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Shield, Eye, EyeOff } from 'lucide-react';

const PasswordSetup: React.FC = () => {
    const { updatePassword, setIsSettingPassword } = useSchool();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await updatePassword(password);
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao definir senha.');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-white to-slate-50">
                <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl border border-slate-100 p-12 space-y-10 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-600 rounded-[28px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200">
                        <Shield className="text-white w-10 h-10" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Senha Definida!</h1>
                        <p className="text-slate-500 font-medium">Sua conta foi protegida com sucesso. Agora você pode acessar todas as funcionalidades do SEI.</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsSettingPassword(false);
                            window.location.reload(); // Garante atualização do estado de auth
                        }}
                        className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        Confirmar e Acessar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50">
            <div className="w-full max-w-md bg-white rounded-[48px] shadow-2xl border border-slate-100 p-12 space-y-10 animate-in zoom-in-95 duration-500">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200">
                        <Shield className="text-white w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Segurança da Conta</h1>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Defina sua senha de acesso</p>
                    </div>
                </div>

                <p className="text-sm text-slate-500 text-center leading-relaxed font-medium">
                    Você foi convidado para o sistema. Por favor, crie uma senha segura para proteger sua conta.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nova Senha</label>
                        <div className="relative">
                            <input
                                required
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-bold text-slate-700 focus:bg-white focus:border-indigo-300 transition-all shadow-inner"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Confirmar Senha</label>
                        <input
                            required
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-bold text-slate-700 focus:bg-white focus:border-indigo-300 transition-all shadow-inner"
                        />
                    </div>

                    {error && <p className="text-center text-red-500 text-[10px] font-bold uppercase bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-[#0A1128] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Definir Senha e Entrar'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsSettingPassword(false)}
                        className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                        Cancelar e Voltar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordSetup;
