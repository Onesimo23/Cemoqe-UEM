import React, { useState, useRef, useEffect, useMemo } from 'react';
import InstructorLayout from '../../layouts/InstructorLayout';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, where, getDoc, doc } from 'firebase/firestore';
import { 
  Users, 
  DollarSign, 
  Star, 
  TrendingUp, 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  PlayCircle,
  ChevronDown,
  Check,
  Filter,
  BarChart3
} from 'lucide-react';

const InstructorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [salesFilter, setSalesFilter] = useState('Últimos 7 dias');

  // Estado com dados reais
  const [stats, setStats] = useState({ totalRevenue: 0, activeCourses: 0, totalStudents: 0, avgRating: 0, completionRate: 0 });
  const [perCourse, setPerCourse] = useState<Array<{ id: string; label: string; count: number; revenue: number }>>([]);
  const [recentStudents, setRecentStudents] = useState<Array<{ id: string; name: string; when: string }>>([]);
  const [series, setSeries] = useState<Array<{ label: string; value: number }>>([]);

  // Helpers
  const parsePriceMZM = (val: any): number => {
    if (typeof val === 'number') return val;
    const s = (val || '').toString().trim();
    if (!s) return 0;
    // remove separador milhar . e troca , por .
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  };

  // Carrega cursos, inscrições e submissões do instrutor
  useEffect(() => {
    if (!user?.uid) { setStats({ totalRevenue: 0, activeCourses: 0, totalStudents: 0, avgRating: 0, completionRate: 0 }); setPerCourse([]); setRecentStudents([]); setSeries([]); return; }

    let enrollUnsubs: Array<() => void> = [];
    let coursesUnsub: (() => void) | null = null;
    let fallbackUnsub: (() => void) | null = null;
    let nameUnsub: (() => void) | null = null;
    let subsUnsub: (() => void) | null = null;

    const recomputeSeries = (items: Array<{ ts: Date; amount: number }>, days: number) => {
      // Gera labels diárias dos últimos N dias
      const end = new Date();
      const data: Array<{ label: string; value: number }> = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(end.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('pt-PT', { weekday: 'short' });
        const value = items.filter(it => it.ts.toISOString().slice(0, 10) === key).reduce((acc, it) => acc + it.amount, 0);
        data.push({ label, value });
      }
      setSeries(data);
    };

    const subscribeEnrollments = (courseDocs: any[]) => {
      enrollUnsubs.forEach(u => u());
      enrollUnsubs = [];
      if (subsUnsub) { subsUnsub(); subsUnsub = null; }

      const courseMap: Record<string, { title: string; price: number; paid: boolean }> = {};
      const courseIds: string[] = [];
      let ratingSum = 0; let ratingCount = 0; let activeCount = 0;
      courseDocs.forEach(d => {
        const data: any = d.data();
        courseIds.push(d.id);
        const price = parsePriceMZM(data?.price);
        const paid = (data?.priceType || 'paid') !== 'free' && price > 0;
        courseMap[d.id] = { title: data?.title || 'Curso', price, paid };
        if (typeof data?.rating === 'number') { ratingSum += data.rating; ratingCount += 1; }
        if (data?.isActive || data?.status === 'Publicado') activeCount += 1;
      });

      if (courseIds.length === 0) {
        setStats({ totalRevenue: 0, activeCourses: 0, totalStudents: 0, avgRating: ratingCount ? (ratingSum / ratingCount) : 0, completionRate: 0 });
        setPerCourse([]); setRecentStudents([]); setSeries([]);
        return;
      }

      // Series auxiliares em memória
      const allEnrollMap = new Map<string, any>();

      const chunk = (arr: string[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
      const chunks = chunk(courseIds, 10);

      chunks.forEach(ids => {
        const qA = query(collection(db, 'enrollments'), where('course_id', 'in', ids));
        const qB = query(collection(db, 'enrollments'), where('courseId', 'in', ids));

        const handleSnap = async (snap: any) => {
          const list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
          // Merge em memória (normalizando e deduplicando por doc.id)
          list.forEach((rec: any) => {
            const course_id = rec.course_id || rec.courseId;
            const user_uid = rec.user_uid || rec.userId || rec.uid;
            if (!course_id || !user_uid) return;
            const ts: Date | null = rec?.enrolledAt?.toDate ? rec.enrolledAt.toDate() : (rec?.createdAt?.toDate ? rec.createdAt.toDate() : null);
            const norm = { ...rec, course_id, user_uid, ts };
            allEnrollMap.set(rec.id, norm);
          });

          // Agregações
          const byCourse = new Map<string, { label: string; count: number; revenue: number }>();
          const seenEnrollIds = new Set<string>();
          const revenueEvents: Array<{ ts: Date; amount: number }> = [];
          const uniqueEnrollmentPairs = new Set<string>();

          Array.from(allEnrollMap.values()).forEach((rec: any) => {
            const c = byCourse.get(rec.course_id) || { label: (courseMap[rec.course_id]?.title || rec.course_title || 'Curso'), count: 0, revenue: 0 };
            c.count += 1;
            // Receita por inscrição (apenas cursos pagos)
            if (courseMap[rec.course_id]?.paid) {
              c.revenue += courseMap[rec.course_id]?.price || 0;
              if (rec.ts) revenueEvents.push({ ts: rec.ts, amount: courseMap[rec.course_id]?.price || 0 });
            }
            byCourse.set(rec.course_id, c);
            uniqueEnrollmentPairs.add(`${rec.user_uid}::${rec.course_id}`);
            seenEnrollIds.add(rec.id);
          });

          const perCourseArr = Array.from(byCourse.entries()).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.count - a.count);
          const totalStudents = Array.from(uniqueEnrollmentPairs.values()).length;
          const totalRevenue = perCourseArr.reduce((acc, it) => acc + it.revenue, 0);
          const avgRating = (ratingCount ? (ratingSum / ratingCount) : 0);

          setPerCourse(perCourseArr);
          setStats(prev => ({ ...prev, totalRevenue, totalStudents, activeCourses: activeCount, avgRating }));

          // Recalcular série conforme filtro atual
          const days = salesFilter === 'Últimos 30 dias' ? 30 : (salesFilter === 'Último trimestre' ? 90 : 7);
          recomputeSeries(revenueEvents, days);

          // Alunos recentes (5 últimos)
          const recent = Array.from(allEnrollMap.values())
            .filter(e => e.ts)
            .sort((a, b) => (b.ts as any) - (a.ts as any))
            .slice(0, 5);
          const withProfiles = await Promise.all(recent.map(async (r: any) => {
            try {
              const ps = await getDoc(doc(db, 'profiles', r.user_uid));
              const name = ps.exists() ? ((ps.data() as any)?.full_name || 'Aluno') : 'Aluno';
              const when = r.ts ? new Intl.RelativeTimeFormat('pt-PT', { numeric: 'auto' }).format(Math.round(((r.ts.getTime() - Date.now()) / 3600000)), 'hour') : '';
              return { id: r.user_uid, name, when };
            } catch { return { id: r.user_uid, name: 'Aluno', when: '' }; }
          }));
          setRecentStudents(withProfiles);
        };

        const u1 = onSnapshot(qA, handleSnap);
        const u2 = onSnapshot(qB, handleSnap);
        enrollUnsubs.push(u1); enrollUnsubs.push(u2);
      });

      // Completion rate via submissions (distintos user_uid::course_id)
      subsUnsub = onSnapshot(query(collection(db, 'submissions'), where('instructor_uid', '==', user.uid)), (snap) => {
        const keys = new Set<string>();
        snap.docs.forEach(d => {
          const data: any = d.data();
          const k = `${data?.user_uid || ''}::${data?.course_id || ''}`;
          if (data?.user_uid && data?.course_id) keys.add(k);
        });
        const withSubmission = keys.size;
        setStats(prev => {
          const total = Math.max(1, prev.totalStudents);
          return { ...prev, completionRate: Math.min(100, Math.round((withSubmission / total) * 100)) };
        });
      });
    };

    // Cursos do instrutor com fallbacks
    coursesUnsub = onSnapshot(query(collection(db, 'courses'), where('instructor_uid', '==', user.uid)), (snap) => {
      if (snap.empty) {
        fallbackUnsub = onSnapshot(query(collection(db, 'courses'), where('creator_uid', '==', user.uid)), (snap2) => {
          if (snap2.empty) {
            const name = (user.displayName || '').trim();
            if (name) {
              nameUnsub = onSnapshot(query(collection(db, 'courses'), where('instructor', '==', name)), (snap3) => {
                subscribeEnrollments(snap3.docs);
              });
            } else {
              subscribeEnrollments([]);
            }
          } else {
            subscribeEnrollments(snap2.docs);
          }
        });
      } else {
        subscribeEnrollments(snap.docs);
      }
    });

    return () => {
      enrollUnsubs.forEach(u => u());
      if (coursesUnsub) coursesUnsub();
      if (fallbackUnsub) fallbackUnsub();
      if (nameUnsub) nameUnsub();
      if (subsUnsub) subsUnsub();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, salesFilter]);

  const maxSales = useMemo(() => Math.max(1, ...series.map(d => d.value)), [series]);

  return (
    <InstructorLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard do Instrutor</h1>
            <p className="text-slate-500 mt-1">Veja como está o desempenho dos seus cursos hoje.</p>
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-3 shadow-sm">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sistema Online • 24 Out 2024</span>
          </div>
        </div>

        {/* Stats Grid - 5 Cards (Including Active Courses) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <InstructorStatCard 
            label="Receita Total" 
            value={`MZM ${stats.totalRevenue.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}`} 
            icon={<DollarSign className="text-emerald-600" />} 
            trend={`Período: ${salesFilter}`}
            trendType="up"
          />
          <InstructorStatCard 
            label="Cursos Ativos" 
            value={String(stats.activeCourses).padStart(2, '0')} 
            icon={<BookOpen className="text-brand-green" />} 
            trend="Ativos agora"
            trendType="neutral"
          />
          <InstructorStatCard 
            label="Total de Alunos" 
            value={stats.totalStudents.toString()} 
            icon={<Users className="text-blue-600" />} 
            trend="em todos os cursos"
            trendType="up"
          />
          <InstructorStatCard 
            label="Avaliação Média" 
            value={stats.avgRating.toFixed(1)} 
            icon={<Star className="text-brand-accent fill-brand-accent" />} 
            trend="Avaliação global"
            trendType="neutral"
          />
          <InstructorStatCard 
            label="Taxa de Conclusão" 
            value={`${stats.completionRate}%`} 
            icon={<TrendingUp className="text-purple-600" />} 
            trend="alunos com submissões"
            trendType="up"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* NOVO: Estudantes Inscritos por Curso (Acima do gráfico de crescimento) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-green" />
                    <h3 className="font-bold text-slate-800">Estudantes Inscritos por Curso</h3>
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacidade Total: 100%</span>
               </div>
               
               <div className="space-y-5">
                  {perCourse.slice(0,4).map((c, idx) => (
                    <CourseRegistrationBar 
                      key={c.id}
                      label={c.label}
                      count={c.count}
                      total={Math.max(1, stats.totalStudents)}
                      color={["bg-blue-500","bg-emerald-500","bg-brand-green","bg-brand-accent"][idx % 4]}
                    />
                  ))}
                  {perCourse.length === 0 && (
                    <div className="text-xs text-slate-400">Sem inscrições ainda.</div>
                  )}
               </div>
            </div>

            {/* Gráfico de Crescimento de Vendas (Barras) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                 <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-brand-green" />
                    <h3 className="font-bold text-slate-800">Crescimento de Vendas</h3>
                 </div>
                 
                 <Select 
                    className="w-full sm:w-44" 
                    value={salesFilter}
                    onValueChange={setSalesFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopover>
                      <SelectListBox>
                        <SelectItem value="Últimos 7 dias">Últimos 7 dias</SelectItem>
                        <SelectItem value="Últimos 30 dias">Últimos 30 dias</SelectItem>
                        <SelectItem value="Último trimestre">Último trimestre</SelectItem>
                      </SelectListBox>
                    </SelectPopover>
                  </Select>
               </div>
               
               {/* Sales Bar Chart - High Visibility Version */}
               <div className="relative h-72 w-full mt-4 flex items-end">
                  {/* Background Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4">
                     {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-full border-t border-slate-50 relative">
                           <span className="absolute -left-2 -top-2 text-[8px] font-black text-slate-300">
                             {Math.round((maxSales / 4) * (5 - i))}
                           </span>
                        </div>
                     ))}
                  </div>

                  {/* Bars Container */}
                  <div className="flex-1 h-full flex items-end justify-around gap-2 px-2 z-10">
                    {series.map((data, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                         {/* Value Label (Top of Bar) */}
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl pointer-events-none z-20">
                            MZM {data.value.toLocaleString('pt-MZ')}
                         </div>
                         
                         {/* Bar */}
                         <div 
                            className="w-full max-w-[40px] bg-gradient-to-t from-brand-green to-brand-green/80 rounded-t-lg transition-all duration-500 hover:brightness-110 shadow-sm" 
                            style={{ height: `${(data.value / maxSales) * 85}%` }}
                         >
                            {/* Inner Accent Line */}
                            <div className="w-full h-1 bg-white/20 rounded-t-lg"></div>
                         </div>

                         {/* Axis Label */}
                         <span className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate max-w-full">
                           {data.label}
                         </span>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-center gap-8">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded bg-brand-green"></div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vendas em MZM</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta Diária</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
                  Alunos Recentes
                  <button className="text-xs text-brand-green font-bold hover:underline">Ver todos</button>
               </h3>
               <div className="space-y-4">
                 {recentStudents.map(s => (
                   <div key={s.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors">
                     <div className="flex items-center gap-3">
                       <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=ebf5ef&color=0e7038`} className="w-9 h-9 rounded-full border-2 border-white shadow-sm" alt="Student" />
                       <div>
                         <p className="text-sm font-bold text-slate-900 leading-none">{s.name}</p>
                         <p className="text-[10px] text-gray-500 mt-1">{s.when || ''}</p>
                       </div>
                     </div>
                     <div className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 uppercase">Pago</div>
                   </div>
                 ))}
                 {recentStudents.length === 0 && (
                   <div className="text-xs text-slate-400">Sem novas inscrições.</div>
                 )}
               </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl">
               {/* Decorative blob */}
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-green/20 rounded-full blur-3xl"></div>
               
               <div className="relative z-10">
                  <div className="bg-brand-green/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                    <PlayCircle className="text-brand-accent w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Impulsione suas vendas</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">"Alunos que recebem certificados nos primeiros 7 dias têm 85% mais chance de comprar um segundo curso."</p>
                  <button className="w-full py-3 bg-brand-green hover:bg-brand-dark text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-black/20">
                    Aumentar Engajamento
                  </button>
               </div>
            </div>
          </div>

        </div>
      </div>
    </InstructorLayout>
  );
};

// --- Helper Components ---

const InstructorStatCard = ({ label, value, icon, trend, trendType }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 group hover:border-brand-green/30 transition-all hover:shadow-md">
    <div className="flex justify-between items-start">
      <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-brand-green/5 transition-colors">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${
        trendType === 'up' ? 'bg-emerald-50 text-emerald-600' : 
        trendType === 'down' ? 'bg-red-50 text-red-600' : 
        'bg-slate-50 text-slate-500'
      }`}>
        {trendType === 'up' && <ArrowUpRight size={10} />}
        {trendType === 'down' && <ArrowDownRight size={10} />}
        {trend}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-green transition-colors">{value}</h3>
    </div>
  </div>
);

const CourseRegistrationBar = ({ label, count, total, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <span className="text-xs font-bold text-slate-700 truncate max-w-[70%]">{label}</span>
      <span className="text-[10px] font-black text-slate-400">{count} ALUNOS</span>
    </div>
    <div className="w-full h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
      <div 
        className={`${color} h-full rounded-full transition-all duration-1000 ease-out shadow-sm`} 
        style={{ width: `${(count / total) * 100}%` }}
      ></div>
    </div>
  </div>
);

// --- Custom Select Components for Dashboard ---

const SelectContext = React.createContext<any>(null);

const Select = ({ children, className, value, onValueChange, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, placeholder }}>
      <div ref={containerRef} className={`relative ${className}`}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children }: any) => {
  const { setIsOpen, isOpen } = React.useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green transition-all shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        {children}
      </div>
      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

const SelectValue = () => {
  const { value, placeholder } = React.useContext(SelectContext);
  return <span className={!value ? 'text-slate-400' : 'text-slate-800 truncate'}>{value || placeholder}</span>;
};

const SelectPopover = ({ children }: any) => {
  const { isOpen } = React.useContext(SelectContext);
  if (!isOpen) return null;
  return (
    <div className="absolute top-full mt-2 left-0 z-[100] w-full min-w-[10rem] overflow-hidden rounded-xl border border-gray-100 bg-white text-slate-950 shadow-xl animate-in fade-in zoom-in-95 duration-200">
      {children}
    </div>
  );
};

const SelectListBox = ({ children }: any) => {
  return <div className="p-1">{children}</div>;
};

const SelectItem = ({ children, value }: any) => {
  const { onValueChange, setIsOpen, value: selectedValue } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;
  
  return (
    <button
      type="button"
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      className={`relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 pl-3 pr-8 text-xs font-bold outline-none hover:bg-slate-50 transition-colors ${
        isSelected ? 'bg-brand-green/5 text-brand-green' : 'text-slate-600'
      }`}
    >
      <span className="truncate">{children}</span>
      {isSelected && (
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
};

export default InstructorDashboardPage;