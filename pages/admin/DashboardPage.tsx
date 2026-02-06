
import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Users, 
  GraduationCap, 
  DollarSign, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  AlertCircle,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome & Global Status */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Visão Geral da Rede</h1>
            <p className="text-slate-500 mt-1">Bem-vindo ao Backoffice. Controle central do ecossistema EduPrime.</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 bg-brand-light/50 rounded-xl flex items-center justify-center text-brand-green">
                   <TrendingUp size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Crescimento Mes</p>
                   <p className="text-lg font-black text-brand-green leading-none">+24.5%</p>
                </div>
             </div>
          </div>
        </div>

        {/* Global KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <AdminStatCard label="Total Estudantes" value="52.480" subValue="+1.2k este mês" icon={<Users className="text-blue-600" />} />
           <AdminStatCard label="Tutores Ativos" value="128" subValue="14 pendentes" icon={<GraduationCap className="text-brand-green" />} />
           <AdminStatCard label="Volume Bruto (GMV)" value="MZM 840.500" subValue="Comissão: MZM 126k" icon={<DollarSign className="text-brand-accent" />} />
           <AdminStatCard label="Cursos em Vitrine" value="342" subValue="85% Taxa de aprovação" icon={<ShieldCheck className="text-emerald-500" />} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           
           {/* Pending Approvals */}
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       <Clock size={18} className="text-amber-500" />
                       Aprovações Pendentes
                    </h3>
                    <button className="text-xs font-bold text-brand-green hover:underline">Ver fila completa</button>
                 </div>
                 <div className="divide-y divide-slate-100">
                    <ApprovalRow 
                       name="Ricardo Mello" 
                       type="Tutor" 
                       detail="Design Gráfico • 12 anos exp" 
                       date="Há 10 min" 
                    />
                    <ApprovalRow 
                       name="Mastering Advanced React" 
                       type="Curso" 
                       detail="Instrutor: Carlos Mendes" 
                       date="Há 2 horas" 
                    />
                    <ApprovalRow 
                       name="Fernanda Oliveira" 
                       type="Tutor" 
                       detail="Liderança de Produtos Tech" 
                       date="Hoje, 09:15" 
                    />
                 </div>
              </div>

              {/* System Alerts */}
              <div className="grid sm:grid-cols-2 gap-6">
                 <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex gap-4">
                    <AlertCircle className="text-red-600 shrink-0" size={24} />
                    <div>
                       <h4 className="font-bold text-red-900 text-sm">Denúncia de Conteúdo</h4>
                       <p className="text-xs text-red-700/70 mt-1 leading-relaxed">3 usuários reportaram o curso "Dropshipping Express" por conteúdo enganoso.</p>
                       <button className="mt-4 text-[10px] font-black uppercase text-red-600 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-600 hover:text-white transition-all shadow-sm">Revisar Agora</button>
                    </div>
                 </div>
                 <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex gap-4">
                    <CheckCircle2 className="text-emerald-600 shrink-0" size={24} />
                    <div>
                       <h4 className="font-bold text-emerald-900 text-sm">Backup Concluído</h4>
                       <p className="text-xs text-emerald-700/70 mt-1 leading-relaxed">A sincronização do banco de dados foi feita com sucesso.</p>
                       <p className="mt-4 text-[10px] font-black text-emerald-600 uppercase">Há 45 minutos</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Platform Insights Sidebar */}
           <div className="space-y-6">
              <div className="bg-brand-dark rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-green/30 rounded-full blur-3xl"></div>
                 <h3 className="text-lg font-bold mb-6">Receita da Plataforma (15%)</h3>
                 <div className="space-y-6">
                    <div>
                       <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-1">Este Mês</p>
                       <p className="text-3xl font-black">MZM 126.075,00</p>
                    </div>
                    <div className="h-px bg-white/10"></div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Meta de Vendas</p>
                          <p className="text-sm font-bold">85% Atingida</p>
                       </div>
                       <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Novos Assinantes</p>
                          <p className="text-sm font-bold">+412</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                 <h4 className="font-bold text-slate-900 mb-6">Logs de Atividade</h4>
                 <div className="space-y-4">
                    <LogItem text="Admin aprovou o saque de MZM 5.000" time="14:20" />
                    <LogItem text="Novo curso 'UX Writer' publicado" time="12:05" />
                    <LogItem text="Configurações de SEO alteradas" time="Ontem" />
                 </div>
                 <button className="w-full mt-8 py-3 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-xl hover:bg-slate-100 transition-all">Ver Logs do Sistema</button>
              </div>
           </div>

        </div>
      </div>
    </AdminLayout>
  );
};

const AdminStatCard = ({ label, value, subValue, icon }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
     <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-brand-light/50 transition-colors">
           {icon}
        </div>
        <button className="p-2 text-slate-300 hover:text-slate-500">
           <MoreVertical size={16} />
        </button>
     </div>
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        <p className="text-xs font-bold text-brand-green mt-1">{subValue}</p>
     </div>
  </div>
);

const ApprovalRow = ({ name, type, detail, date }: any) => (
  <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
     <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
           {name.charAt(0)}
        </div>
        <div>
           <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-800">{name}</p>
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                 type === 'Curso' ? 'bg-brand-light text-brand-green' : 'bg-brand-accent/10 text-brand-accent'
              }`}>{type}</span>
           </div>
           <p className="text-[10px] text-slate-400 font-medium">{detail}</p>
        </div>
     </div>
     <div className="flex items-center gap-3">
        <span className="text-[10px] text-slate-400 font-medium">{date}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button className="p-2 bg-white text-emerald-500 border border-emerald-100 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm" title="Aprovar">
              <CheckCircle2 size={16} />
           </button>
           <button className="p-2 bg-white text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors shadow-sm" title="Rejeitar">
              <XCircle size={16} />
           </button>
        </div>
     </div>
  </div>
);

const LogItem = ({ text, time }: any) => (
  <div className="flex justify-between items-start gap-4">
     <p className="text-xs text-slate-600 font-medium leading-tight">{text}</p>
     <span className="text-[10px] text-slate-400 font-black whitespace-nowrap">{time}</span>
  </div>
);

export default AdminDashboardPage;
