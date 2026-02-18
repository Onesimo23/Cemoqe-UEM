import React, { useEffect, useMemo, useState } from 'react';
import InstructorLayout from '../../layouts/InstructorLayout';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, where, getDoc, doc } from 'firebase/firestore';
import { TrendingUp, Users, Award, BookOpen, Star, ArrowUpRight, ArrowDownRight, DollarSign, Calendar } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [periodLabel] = useState('Últimos 30 dias');
  const periodDays = 30;

  // Overview stats
  const [visitsTotal, setVisitsTotal] = useState(0);
  const [revenueMZM, setRevenueMZM] = useState(0);
  const [enrollmentRate, setEnrollmentRate] = useState(0);
  const [avgEngagement, setAvgEngagement] = useState(0);

  // Revenue by course
  const [courseRevenue, setCourseRevenue] = useState<Array<{ id: string; title: string; amount: number }>>([]);

  // Academic summary
  const [classesCompleted, setClassesCompleted] = useState(0);
  const [certificatesIssued, setCertificatesIssued] = useState(0);
  const [answersResolved, setAnswersResolved] = useState(0);

  // Regions
  const [regions, setRegions] = useState<Array<{ name: string; count: number }>>([]);
  const [enrollPairsCount, setEnrollPairsCount] = useState(0);

  const parsePriceMZM = (val: any): number => {
    if (typeof val === 'number') return val;
    const s = (val || '').toString().trim();
    if (!s) return 0;
    return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
  };

  useEffect(() => {
    if (!user?.uid) {
      setVisitsTotal(0); setRevenueMZM(0); setEnrollmentRate(0); setAvgEngagement(0);
      setCourseRevenue([]); setClassesCompleted(0); setCertificatesIssued(0); setAnswersResolved(0); setRegions([]); setEnrollPairsCount(0);
      return;
    }

    let coursesUnsub: (() => void) | null = null;
    let fallbackUnsub: (() => void) | null = null;
    let nameUnsub: (() => void) | null = null;
    let enrollUnsubs: Array<() => void> = [];
    let subsUnsub: (() => void) | null = null;
    let certsUnsub: (() => void) | null = null;
    let answersUnsub: (() => void) | null = null;
    let questionsUnsubs: Array<() => void> = [];
    let analyticsUnsubs: Array<() => void> = [];

    const now = Date.now();
    const since = now - periodDays * 24 * 3600 * 1000;

    const subscribeVisits = () => {
      // Coleções comuns; se não houver, fica 0
      const targets = [
        { col: 'analytics', countFields: ['visits', 'count', 'pageViews', 'visitors'] },
        { col: 'visits', countFields: ['count', 'visits', 'pageViews', 'visitors'] },
      ];
      analyticsUnsubs.forEach(u => u());
      questionsUnsubs.forEach(u => u());
      analyticsUnsubs = [];
      targets.forEach(t => {
        const u = onSnapshot(query(collection(db, t.col), where('instructor_uid', '==', user.uid)), (snap) => {
          let local = 0;
          snap.docs.forEach(d => {
            const data: any = d.data();
            const ts = data?.createdAt?.toDate ? data.createdAt.toDate() : (data?.ts?.toDate ? data.ts.toDate() : null);
            const inRange = !ts || ts.getTime() >= since; // se não tem timestamp, considera
            if (!inRange) return;
            for (const f of t.countFields) {
              if (typeof data?.[f] === 'number') { local += data[f]; break; }
            }
          });
          setVisitsTotal(local);
        });
        analyticsUnsubs.push(u);
      });
    };

    const subscribeCore = (courseDocs: any[]) => {
      enrollUnsubs.forEach(u => u());
      enrollUnsubs = [];

      const courseIds: string[] = [];
      const courseMap: Record<string, { title: string; certificatePrice: number }> = {};
      courseDocs.forEach(d => {
        const data: any = d.data();
        courseIds.push(d.id);
        const certificatePrice = parsePriceMZM(data?.certificatePrice);
        courseMap[d.id] = { title: data?.title || 'Curso', certificatePrice };
      });

      if (courseIds.length === 0) {
        setRevenueMZM(0); setCourseRevenue([]); setRegions([]); setEnrollPairsCount(0);
        subscribeVisits();
        return;
      }

      subscribeVisits();

      const chunk = (arr: string[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
      const chunks = chunk(courseIds, 10);

      const enrolls = new Map<string, any>();

      chunks.forEach(ids => {
        const qA = query(collection(db, 'enrollments'), where('course_id', 'in', ids));
        const qB = query(collection(db, 'enrollments'), where('courseId', 'in', ids));

        const handleSnap = async (snap: any) => {
          snap.docs.forEach((d: any) => {
            const data: any = d.data();
            const course_id = data.course_id || data.courseId;
            const user_uid = data.user_uid || data.userId || data.uid;
            const ts: Date | null = data?.enrolledAt?.toDate ? data.enrolledAt.toDate() : (data?.createdAt?.toDate ? data.createdAt.toDate() : null);
            if (!course_id || !user_uid || !ts) return;
            if (ts.getTime() < since) return;
            enrolls.set(d.id, { id: d.id, course_id, user_uid, ts, certificatePaid: data.certificatePaid, certificatePrice: data.certificatePrice });
          });

          // Receita por certificados pagos
          const byCourse = new Map<string, number>();
          const uniqueEnrollPairs = new Set<string>();
          enrolls.forEach((e: any) => {
            uniqueEnrollPairs.add(`${e.user_uid}::${e.course_id}`);
            if (e.certificatePaid) {
              byCourse.set(e.course_id, (byCourse.get(e.course_id) || 0) + (e.certificatePrice || 0));
            }
          });
          setEnrollPairsCount(uniqueEnrollPairs.size);
          const revenueArr = Array.from(byCourse.entries()).map(([id, amount]) => ({ id, title: courseMap[id]?.title || 'Curso', amount }));
          revenueArr.sort((a, b) => b.amount - a.amount);
          setCourseRevenue(revenueArr);
          const totalRevenue = revenueArr.reduce((acc, r) => acc + r.amount, 0);
          setRevenueMZM(totalRevenue);

          // Regiões
          const uniqueUsers = Array.from(new Set(Array.from(enrolls.values()).map((e: any) => e.user_uid))).slice(0, 50);
          const profs = await Promise.all(uniqueUsers.map(async (uid: string) => {
            try { const ps = await getDoc(doc(db, 'profiles', uid)); return ps.exists() ? (ps.data() as any) : null; } catch { return null; }
          }));
          const counts = new Map<string, number>();
          profs.forEach(p => {
            const country = (p?.country || p?.location || 'Moçambique') as string;
            counts.set(country, (counts.get(country) || 0) + 1);
          });
          const regionArr = Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
          regionArr.sort((a, b) => b.count - a.count);
          setRegions(regionArr);

          // Taxa de matrícula (enrolls / visitas)
          setVisitsTotal(v => {
            const rate = Math.round(((enrolls.size) / Math.max(1, v)) * 100);
            setEnrollmentRate(rate);
            return v;
          });
        };

        const u1 = onSnapshot(qA, handleSnap);
        const u2 = onSnapshot(qB, handleSnap);
        enrollUnsubs.push(u1); enrollUnsubs.push(u2);
      });

      // Submissões (engajamento e aulas concluídas)
      subsUnsub = onSnapshot(query(collection(db, 'submissions'), where('instructor_uid', '==', user.uid)), (snap) => {
        let count = 0; const pairs = new Set<string>();
        snap.docs.forEach(d => {
          const data: any = d.data();
          const ts: Date | null = data?.submittedAt?.toDate ? data.submittedAt.toDate() : (data?.createdAt?.toDate ? data.createdAt.toDate() : null);
          if (ts && ts.getTime() >= since) {
            count += 1;
            if (data?.user_uid && data?.course_id) pairs.add(`${data.user_uid}::${data.course_id}`);
          }
        });
        setClassesCompleted(count);
        const engaged = pairs.size;
        const baseline = Math.max(1, enrollPairsCount);
        setAvgEngagement(Math.min(100, Math.round((engaged / baseline) * 100)));
      });

      // Certificados (se existir)
      certsUnsub = onSnapshot(query(collection(db, 'certificates'), where('instructor_uid', '==', user.uid)), (snap) => {
        let count = 0;
        snap.docs.forEach(d => {
          const data: any = d.data();
          const ts: Date | null = data?.issuedAt?.toDate ? data.issuedAt.toDate() : (data?.createdAt?.toDate ? data.createdAt.toDate() : null);
          if (!ts || ts.getTime() >= since) count += 1;
        });
        setCertificatesIssued(count);
      });

      // Dúvidas Resolvidas: somatório de repliesCount das perguntas dos cursos do instrutor (best-effort)
      questionsUnsubs.forEach(u => u());
      questionsUnsubs = [];
      const qChunks = chunks;
      qChunks.forEach(ids => {
        const qQ = query(collection(db, 'questions'), where('course_id', 'in', ids));
        const u = onSnapshot(qQ, (snap) => {
          let sum = 0;
          snap.docs.forEach(d => {
            const data: any = d.data();
            const ts: Date | null = data?.createdAt?.toDate ? data.createdAt.toDate() : null;
            if (ts && ts.getTime() < since) return;
            sum += (typeof data?.repliesCount === 'number' ? data.repliesCount : 0);
          });
          setAnswersResolved(prev => sum);
        });
        questionsUnsubs.push(u);
      });
    };

    // Cursos do instrutor (com fallbacks e incluindo rascunhos)
    coursesUnsub = onSnapshot(query(collection(db, 'courses'), where('instructor_uid', '==', user.uid)), (snap) => {
      if (snap.empty) {
        fallbackUnsub = onSnapshot(query(collection(db, 'courses'), where('creator_uid', '==', user.uid)), (snap2) => {
          if (snap2.empty) {
            const name = (user.displayName || '').trim();
            if (name) {
              nameUnsub = onSnapshot(query(collection(db, 'courses'), where('instructor', '==', name)), (snap3) => subscribeCore(snap3.docs));
            } else { subscribeCore([]); }
          } else { subscribeCore(snap2.docs); }
        });
      } else { subscribeCore(snap.docs); }
    });

    return () => {
      if (coursesUnsub) coursesUnsub();
      if (fallbackUnsub) fallbackUnsub();
      if (nameUnsub) nameUnsub();
      enrollUnsubs.forEach(u => u());
      if (subsUnsub) subsUnsub();
      if (certsUnsub) certsUnsub();
      if (answersUnsub) answersUnsub();
      analyticsUnsubs.forEach(u => u());
    };
  }, [user?.uid]);

  const topCourseRevenue = useMemo(() => {
    const total = Math.max(1, courseRevenue.reduce((acc, r) => acc + r.amount, 0));
    return courseRevenue.slice(0, 3).map(r => ({ title: r.title, amount: `MZM ${r.amount.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}`, percent: Math.round((r.amount / total) * 100) }));
  }, [courseRevenue]);

  const regionDisplay = useMemo(() => {
    if (regions.length === 0) return [{ name: 'Moçambique', value: '100%' }];
    const total = Math.max(1, regions.reduce((acc, r) => acc + r.count, 0));
    return regions.slice(0, 4).map(r => ({ name: r.name, value: `${Math.round((r.count / total) * 100)}%` }));
  }, [regions]);

  return (
    <InstructorLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Relatórios & Performance</h1>
            <p className="text-slate-500 mt-1">Dados detalhados sobre visitas e desempenho de cursos.</p>
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-gray-50 shadow-sm">
            <Calendar size={18} /> {periodLabel}
          </button>
        </div>

        {/* Global Performance Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <PerformanceCard label="Visitas Totais" value={visitsTotal.toLocaleString('pt-MZ')} trend={periodLabel} trendType="up" />
           <PerformanceCard label="Faturamento MZM" value={`MZM ${revenueMZM.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}`} trend={periodLabel} trendType="up" />
           <PerformanceCard label="Taxa de Matrícula" value={`${enrollmentRate}%`} trend={periodLabel} trendType="up" />
           <PerformanceCard label="Engajamento Médio" value={`${avgEngagement}%`} trend={periodLabel} trendType="up" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

           {/* Chart Placeholder 1: Revenue */}
           <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-2">
                 <DollarSign size={20} className="text-brand-green" /> Receita Mensal por Curso
              </h3>
              <div className="space-y-6">
                {topCourseRevenue.map((r, idx) => (
                  <CourseRevenueRow key={idx} title={r.title} amount={r.amount} percent={r.percent} color={["bg-blue-500","bg-brand-green","bg-brand-accent"][idx % 3]} />
                ))}
                {topCourseRevenue.length === 0 && (
                  <div className="text-xs text-slate-400">Sem receita no período.</div>
                )}
              </div>
              <div className="mt-12 pt-8 border-t border-slate-50">
                 <p className="text-xs text-slate-400 leading-relaxed">
                   * Valores brutos antes da comissão da plataforma. Faturamento consolidado até 24 Out 2024.
                 </p>
              </div>
           </div>

           {/* Metrics Sidebar */}
           <div className="space-y-6">
              <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                 <TrendingUp size={32} className="text-brand-accent mb-6" />
                 <h3 className="text-xl font-bold mb-4">Resumo Acadêmico</h3>
                 <div className="space-y-4">
                    <AcademicMetric label="Aulas Concluídas" value={classesCompleted.toLocaleString('pt-MZ')} />
                    <AcademicMetric label="Certificados Emitidos" value={certificatesIssued.toLocaleString('pt-MZ')} />
                    <AcademicMetric label="Dúvidas Resolvidas" value={answersResolved.toLocaleString('pt-MZ')} />
                 </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                 <h4 className="font-bold text-slate-900 mb-6">Alunos por Região</h4>
                 <div className="space-y-4">
                    {regionDisplay.map((r, idx) => (
                      <RegionStat key={idx} name={r.name} value={r.value} />
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </InstructorLayout>
  );
};

const PerformanceCard = ({ label, value, trend, trendType }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-end justify-between">
       <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
       <div className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded ${
         trendType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
       }`}>
         {trendType === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
         {trend}
       </div>
    </div>
  </div>
);

const CourseRevenueRow = ({ title, amount, percent, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
       <span className="text-sm font-bold text-slate-700">{title}</span>
       <span className="text-sm font-bold text-slate-900">{amount}</span>
    </div>
    <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
       <div className={`${color} h-full rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

const AcademicMetric = ({ label, value }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
    <span className="text-sm text-slate-400 font-medium">{label}</span>
    <span className="text-sm font-bold text-white">{value}</span>
  </div>
);

const RegionStat = ({ name, value }: any) => (
  <div className="flex items-center justify-between">
     <span className="text-xs font-bold text-slate-600">{name}</span>
     <span className="text-xs font-black text-brand-green">{value}</span>
  </div>
);

export default ReportsPage;
