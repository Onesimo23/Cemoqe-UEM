import {
  BarChart3,
  Bell,
  FileText,
  Key,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldAlert,
  UserCheck,
  Users,
  X
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useBranding } from "../contexts/BrandingContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, profile, user } = useAuth();
  const { branding } = useBranding();

  const handleLogout = async () => {
    if (window.confirm("Encerrar sessão administrativa?")) {
      try {
        await logout();
      } finally {
        navigate("/", { replace: true });
      }
    }
  };

  const menuItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Gestão de Utilizadores",
      href: "/admin/usuarios",
    },
    {
      icon: <UserCheck className="w-5 h-5" />,
      label: "Gestão de Tutores",
      href: "/admin/tutores",
    },
    {
      icon: <Layers className="w-5 h-5" />,
      label: "Gestão de Conteúdos",
      href: "/admin/conteudos",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "Moderação de Cursos",
      href: "/admin/moderacao",
    },
    {
      icon: <Key className="w-5 h-5" />,
      label: "Gestão de Permissões",
      href: "/admin/permissoes",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Relatório e Analytics",
      href: "/admin/analytics",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Configurações do Sistema",
      href: "/admin/configuracoes",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-brand-green p-1.5 rounded-lg">
              <ShieldAlert className="text-white w-6 h-6" />
            </div>
            <span
              className="text-lg font-bold"
              style={{ fontFamily: branding.appearance.fontFamily }}
            >
              {branding.appearance.platformName}
              <span className="ml-1 text-[10px] bg-brand-accent text-brand-dark px-1.5 py-0.5 rounded font-black uppercase">
                Admin
              </span>
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            {profile?.avatar_url || user?.photoURL ? (
              <img
                src={profile?.avatar_url || user?.photoURL || ""}
                className="w-10 h-10 rounded-full border-2 border-brand-accent/30 object-cover"
                alt="Admin"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center font-bold text-white shadow-inner border-2 border-brand-accent/30">
                AD
              </div>
            )}
            <div>
              <p className="font-semibold text-sm">
                {profile?.full_name || "Super Admin"}
              </p>
              <p className="text-[10px] text-brand-accent font-black uppercase tracking-widest">
                Acesso de Nível 1
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                  ${
                    isActive
                      ? "bg-brand-green text-white shadow-lg shadow-green-900/40"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-red-500 hover:text-white transition-all active:scale-95 group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Sair do Painel
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Desktop */}
        <header className="hidden md:flex bg-white border-b border-slate-200 py-4 px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar usuário, curso ou logs..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green"
              />
            </div>
            <div className="h-6 w-px bg-slate-100"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                Servidores Operacionais
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-brand-green transition-colors bg-slate-50 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-green rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3">
              {profile?.avatar_url || user?.photoURL ? (
                <img
                  src={profile?.avatar_url || user?.photoURL || ""}
                  className="w-8 h-8 rounded-full border-2 border-slate-100 object-cover"
                  alt="Admin"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-green text-white font-bold grid place-items-center border-2 border-slate-100">
                  AD
                </div>
              )}
              <div className="text-sm">
                <p className="font-semibold text-slate-900">
                  {profile?.full_name || "Admin"}
                </p>
                <p className="text-xs text-slate-500">Acesso de Nível 1</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="bg-slate-900 text-white border-b border-white/5 py-4 px-6 md:hidden flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-slate-400"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span
            className="font-bold"
            style={{ fontFamily: branding.appearance.fontFamily }}
          >
            {branding.appearance.platformName}{" "}
            <span className="text-brand-accent">Admin</span>
          </span>
          <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center font-bold text-xs">
            AD
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
