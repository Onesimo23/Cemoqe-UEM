
import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { BarChart3, TrendingUp, Users, DollarSign, Download, Calendar, ArrowUpRight } from 'lucide-react';

const AdminAnalyticsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Relatórios & Analytics</h1>
            <p className="text-slate-500 text-sm">Métricas consolidadas de crescimento e performance da rede.</p>
          </div>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Calendar size={18} /> Período
             </button>
             <button className="flex items-center gap-2 bg-brand-green text-white font-bold px-6 py-2 rounded-xl hover:bg-brand-dark shadow-lg shadow-green-900/10 transition-all">
                <Download size={18} /> Exportar CSV
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <AnalyticsCard label="Novos Utilizadores" value="+2.4k" trend="+15%" icon={<Users size={20} />} color="text-blue-600" />
           <AnalyticsCard label="Receita Bruta" value="MZM 840k" trend="+22%" icon={<DollarSign size={20} />} color="text-brand-accent" />
           <AnalyticsCard label="Sessões Médias" value="12m 45s" trend="+2.1%" icon={<TrendingUp size={20} />} color="text-brand-green" />
           <AnalyticsCard label="Taxa de Churn" value="0.8%" trend="-12%" icon={<BarChart3 size={20} />} color="text-red-600" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-bold text-slate-800">Crescimento de Receita (Plataforma vs Tutores)</h3>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-brand-green"></div>
                       <span className="text-[10px] font-black text-slate-400 uppercase">Taxa 15%</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></div>
                       <span className="text-[10px] font-black text-slate-400 uppercase">Pagos Tutores</span>
                    </div>
                 </div>
              </div>
              
              <div className="flex items-end justify-between h-64 gap-2 pt-10">
                 {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                    <div key={i} className="flex-1 bg-brand-light rounded-t-lg relative group transition-all hover:bg-brand-green" style={{ height: `${20 + (Math.random() * 80)}%` }}>
                       <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap">MZM {i}k</div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-brand-dark text-white p-8 rounded-3xl shadow-xl overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 size={100} /></div>
                 <h3 className="text-lg font-bold mb-6">Categorias Top</h3>
                 <div className="space-y-4">
                    <TopCategoryRow name="Dev & TI" percent={45} />
                    <TopCategoryRow name="Negócios" percent={25} />
                    <TopCategoryRow name="Design" percent={20} />
                 </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                 <h4 className="font-bold text-slate-800 mb-6">Dispositivos</h4>
                 <div className="w-full h-3 bg-slate-100 rounded-full mt-2 overflow-hidden flex">
                    <div className="h-full bg-brand-green w-[65%]"></div>
                    <div className="h-full bg-brand-accent w-[35%]"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const AnalyticsCard = ({ label, value, trend, icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
     <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl bg-slate-50 ${color}`}>{icon}</div>
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"><ArrowUpRight size={10} /> {trend}</span>
     </div>
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <h3 className="text-2xl font-black text-slate-900">{value}</h3>
  </div>
);

const TopCategoryRow = ({ name, percent }: any) => (
  <div className="space-y-2">
     <div className="flex justify-between text-xs font-bold">
        <span>{name}</span>
        <span className="text-brand-green">{percent}%</span>
     </div>
     <div className="w-full h-1.5 bg-brand-light rounded-full overflow-hidden">
        <div className="h-full bg-brand-green rounded-full" style={{ width: `${percent}%` }}></div>
     </div>
  </div>
);

export default AdminAnalyticsPage;
