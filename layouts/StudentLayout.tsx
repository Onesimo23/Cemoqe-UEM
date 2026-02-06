
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap,
  Bell,
  Search,
  MessageSquare,
  Star,
  History,
  Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { profile, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if(window.confirm('Deseja realmente encerrar a sua sessão?')) {
      try {
        await logout();
        // Força o redirecionamento absoluto para a home e limpa o histórico
        navigate('/', { replace: true });
      } catch (error) {
        console.error("Erro ao processar logout:", error);
      }
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Visão Geral', href: '/aluno/dashboard' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Meus Cursos', href: '/aluno/cursos' },
    { icon: <History className="w-5 h-5" />, label: 'Meu Histórico', href: '/aluno/historico' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Fórum', href: '/aluno/forum' },
    { icon: <Award className="w-5 h-5" />, label: 'Certificados', href: '/aluno/certificados' },
    { icon: <Star className="w-5 h-5" />, label: 'Avaliações', href: '/aluno/feedback' },
    { icon: <Settings className="w-5 h-5" />, label: 'Configurações', href: '/aluno/configuracoes' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar Lateral */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-brand-dark text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-lg text-brand-accent">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold">
              Edu<span className="text-brand-accent">Prime</span>
            </span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <img 
              src={profile?.avatar_url || user?.photoURL || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=0e7038&color=fff`} 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-brand-green object-cover shadow-sm"
            />
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{profile?.full_name || "Estudante"}</p>
              <p className="text-[10px] text-brand-accent font-bold uppercase tracking-tight">Painel de Aluno</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                  ${isActive ? 'bg-brand-green text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Botão SAIR DO PAINEL */}
        <div className="p-4 border-t border-white/10">
          <button 
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-red-500 hover:text-white transition-all active:scale-95 group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Sair do Painel
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 md:hidden flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600"><Menu className="w-6 h-6" /></button>
          <span className="font-bold text-gray-800">EduPrime</span>
          <img src={profile?.avatar_url || user?.photoURL || "https://ui-avatars.com/api/?name=User"} className="w-8 h-8 rounded-full object-cover" alt="User" />
        </header>

        {/* Header Desktop (Navbar Superior do Painel) */}
        <header className="hidden md:flex bg-white border-b border-gray-200 py-4 px-8 items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="O que queres aprender hoje?" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/10" />
            </div>
            
            <Link 
              to="/" 
              className="flex items-center gap-2 text-slate-500 hover:text-brand-green font-bold text-[10px] uppercase tracking-widest transition-all px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm"
            >
              <Home className="w-4 h-4" />
              Ir para o Início
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-brand-green transition-colors"><Bell className="w-5 h-5" /></button>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 hidden lg:block">{profile?.full_name || "Estudante"}</span>
              <button 
                type="button"
                onClick={handleLogout} 
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Sair do Sistema"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default StudentLayout;
