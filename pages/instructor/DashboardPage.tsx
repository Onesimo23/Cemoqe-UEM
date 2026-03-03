import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    BookOpen,
    Check,
    ChevronDown,
    Filter,
    Star,
    TrendingUp,
    Users,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import InstructorLayout from "../../layouts/InstructorLayout";
import api from "../../services/api";

const InstructorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [salesFilter, setSalesFilter] = useState("Últimos 7 dias");

  // Estado com dados reais
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeCourses: 0,
    totalStudents: 0,
    avgRating: 0,
    completionRate: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    activeStudents: 0,
    pendingCertificates: 0,
    totalEarnings: 0,
  });
  const [perCourse, setPerCourse] = useState<
    Array<{
      id: string;
      label: string;
      count: number;
      revenue: number;
      completions?: number;
      rating?: number;
    }>
  >([]);
  const [recentStudents, setRecentStudents] = useState<
    Array<{ id: string; name: string; when: string; course?: string }>
  >([]);
  const [series, setSeries] = useState<Array<{ label: string; value: number }>>(
    [],
  );
  const [courseMetrics, setCourseMetrics] = useState<
    Array<{
      id: string;
      title: string;
      students: number;
      avgCompletion: number;
      revenue: number;
      rating: number;
      status: string;
    }>
  >([]);

  // Helpers
  const parsePriceMZM = (val: any): number => {
    if (typeof val === "number") return val;
    const s = (val || "").toString().trim();
    if (!s) return 0;
    // remove separador milhar . e troca , por .
    return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
  };

  // Carrega cursos do instrutor via API
  useEffect(() => {
    if (!user?.uid) {
      setStats({
        totalRevenue: 0,
        activeCourses: 0,
        totalStudents: 0,
        avgRating: 0,
        completionRate: 0,
        monthlyRevenue: 0,
        conversionRate: 0,
        activeStudents: 0,
        pendingCertificates: 0,
        totalEarnings: 0,
      });
      setPerCourse([]);
      setRecentStudents([]);
      setSeries([]);
      setCourseMetrics([]);
      return;
    }

    const loadDashboardData = async () => {
      try {
        // Buscar cursos do instrutor
        const coursesResponse = await api.get("/courses");
        const allCourses = coursesResponse.data || [];
        const instructorCourses = allCourses.filter(
          (c: any) => c.instructor_uid === user.uid && c.is_active === 1,
        );

        // Buscar inscrições do instrutor
        const enrollmentsResponse = await api.get("/enrollments");
        const allEnrollments = enrollmentsResponse.data || [];

        // Filtrar inscrições para os cursos do instrutor
        const courseIds = instructorCourses.map((c: any) => c.id);
        const instructorEnrollments = allEnrollments.filter((e: any) =>
          courseIds.includes(e.course_id),
        );

        // Processar dados
        let totalRevenue = 0;
        let totalStudents = new Set<string>();
        let ratingSum = 0;
        let ratingCount = 0;
        let activeCount = instructorCourses.filter(
          (c: any) => c.is_active === 1,
        ).length;

        const courseMetricsData: any[] = [];

        instructorCourses.forEach((course: any) => {
          const courseEnrollments = instructorEnrollments.filter(
            (e: any) => e.course_id === course.id,
          );

          const students = courseEnrollments.length;
          const completed = courseEnrollments.filter(
            (e: any) => e.completed,
          ).length;
          const avgCompletion =
            students > 0 ? Math.round((completed / students) * 100) : 0;

          courseEnrollments.forEach((e: any) => {
            totalStudents.add(e.user_uid);
          });

          if (typeof course.rating === "number" && course.rating > 0) {
            ratingSum += course.rating;
            ratingCount += 1;
          }

          courseMetricsData.push({
            id: course.id,
            title: course.title,
            students,
            avgCompletion,
            revenue: course.total_revenue || 0,
            rating: course.rating || 0,
            status: course.is_active === 1 ? "Ativo" : "Inativo",
          });

          totalRevenue += course.total_revenue || 0;
        });

        const avgRating = ratingCount ? ratingSum / ratingCount : 0;
        const paidCerts = instructorEnrollments.filter(
          (e: any) => e.certificate_paid === 1,
        ).length;
        const conversionRate =
          totalStudents.size > 0
            ? Math.round((paidCerts / totalStudents.size) * 100)
            : 0;

        // Simular série de dados (últimos 7 dias)
        const end = new Date();
        const seriesData: any[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(end);
          d.setDate(end.getDate() - i);
          const label = d.toLocaleDateString("pt-PT", { weekday: "short" });
          seriesData.push({ label, value: Math.random() * 500 });
        }

        setStats({
          totalRevenue,
          activeCourses: activeCount,
          totalStudents: totalStudents.size,
          avgRating,
          completionRate:
            courseMetricsData.length > 0
              ? Math.round(
                  courseMetricsData.reduce(
                    (a: any, c: any) => a + c.avgCompletion,
                    0,
                  ) / courseMetricsData.length,
                )
              : 0,
          monthlyRevenue: totalRevenue,
          conversionRate,
          activeStudents: totalStudents.size,
          pendingCertificates: 0,
          totalEarnings: totalRevenue,
        });

        setCourseMetrics(courseMetricsData);
        setPerCourse(
          courseMetricsData.map((c: any) => ({
            id: c.id,
            label: c.title,
            count: c.students,
            revenue: c.revenue,
          })),
        );
        setSeries(seriesData);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      }
    };

    loadDashboardData();
  }, [user?.uid, salesFilter]);

  const maxSales = useMemo(
    () => Math.max(1, ...series.map((d) => d.value)),
    [series],
  );

  return (
    <InstructorLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Dashboard do Tutor
            </h1>
            <p className="text-slate-500 mt-1">
              Veja como está o desempenho dos seus cursos hoje.
            </p>
          </div>
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-3 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              UEM-Cursos online•{" "}
              {new Date().toLocaleDateString("pt-MZ", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Stats Grid - 5 Cards (Including Active Courses) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* REMOVIDO: Cards financeiros - O tutor não gerencia finanças */}
          {/*
          <InstructorStatCard
            label="Receita Total"
            value={`MZM ${stats.totalRevenue.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}`}
            icon={<DollarSign className="text-emerald-600" />}
            trend={`+${stats.conversionRate}% conv.`}
            trendType="up"
          />
          <InstructorStatCard
            label="Este Mês"
            value={`MZM ${stats.monthlyRevenue.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}`}
            icon={<TrendingUp className="text-blue-600" />}
            trend="Revenue do mês"
            trendType="up"
          />
          */}
          <InstructorStatCard
            label="Cursos Ativos"
            value={String(stats.activeCourses).padStart(2, "0")}
            icon={<BookOpen className="text-brand-green" />}
            trend="Publicados"
            trendType="neutral"
          />
          <InstructorStatCard
            label="Total de Formandos"
            value={stats.totalStudents.toString()}
            icon={<Users className="text-brand-accent" />}
            trend={`${stats.activeStudents} ativos`}
            trendType="up"
          />
          {/* REMOVIDO: Taxa de Conversão - Métrica financeira */}
          {/*
          <InstructorStatCard
            label="Taxa de Conversão"
            value={`${stats.conversionRate}%`}
            icon={<TrendingUp className="text-purple-600" />}
            trend="com certificado"
            trendType={stats.conversionRate > 50 ? "up" : "down"}
          />
          */}
          <InstructorStatCard
            label="Avaliação Média"
            value={stats.avgRating.toFixed(1)}
            icon={<Star className="text-brand-accent fill-brand-accent" />}
            trend="global"
            trendType="neutral"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Alertas de Performance */}
            {/* REMOVIDO: Alerta de Taxa de Conversão - Métrica financeira */}
            {/*
            {stats.conversionRate < 30 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle
                  className="text-amber-600 mt-1 flex-shrink-0"
                  size={20}
                />
                <div>
                  <p className="font-bold text-amber-900">
                    Taxa de Conversão Baixa
                  </p>
                  <p className="text-xs text-amber-700">
                    Apenas {stats.conversionRate}% dos formandos compraram
                    certificados. Considere adicionar mais conteúdo de
                    qualidade.
                  </p>
                </div>
              </div>
            )}
            */}

            {stats.pendingCertificates > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Check className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-bold text-blue-900">
                    Certificados Pendentes
                  </p>
                  <p className="text-xs text-blue-700">
                    Há {stats.pendingCertificates} certificados aguardando
                    aprovação. Revise-os para melhorar satisfação.
                  </p>
                </div>
              </div>
            )}

            {/* Desempenho por Curso */}
            {courseMetrics.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-brand-green" />
                  <h3 className="font-bold text-slate-800">
                    Desempenho por Curso
                  </h3>
                </div>
                <div className="space-y-4">
                  {courseMetrics.slice(0, 5).map((course) => (
                    <div
                      key={course.id}
                      className="border border-slate-50 rounded-lg p-4 hover:bg-slate-50 transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-2">
                          {course.title}
                        </h4>
                        <span className="text-xs font-bold bg-brand-green/10 text-brand-green px-2 py-1 rounded">
                          Ativo
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-2xl font-bold text-slate-900">
                            {course.students}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Formandos
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {stats.completionRate}%
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Conclusão
                          </p>
                        </div>
                        <div>
                          {/* REMOVIDO: Dados de receita */}
                          {/*
                          <p className="text-2xl font-bold text-emerald-600">
                            MZM {(course.revenue / 1000).toFixed(0)}k
                          </p>
                          <p className="text-[10px] text-slate-500">Receita</p>
                          */}
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-500">
                            ★ {course.rating.toFixed(1)}
                          </p>
                          <p className="text-[10px] text-slate-500">Nota</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOVO: Estudantes Inscritos por Curso (Acima do gráfico de crescimento) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-green" />
                  <h3 className="font-bold text-slate-800">
                    Estudantes Inscritos por Curso
                  </h3>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total: {stats.totalStudents}
                </span>
              </div>

              <div className="space-y-5">
                {perCourse.slice(0, 4).map((c, idx) => (
                  <CourseRegistrationBar
                    key={c.id}
                    label={c.label}
                    count={c.count}
                    total={Math.max(1, stats.totalStudents)}
                    color={
                      [
                        "bg-blue-500",
                        "bg-emerald-500",
                        "bg-brand-green",
                        "bg-brand-accent",
                      ][idx % 4]
                    }
                  />
                ))}
                {perCourse.length === 0 && (
                  <div className="text-xs text-slate-400">
                    Sem inscrições ainda.
                  </div>
                )}
              </div>
            </div>

            {/* REMOVIDO: Gráfico de Crescimento de Vendas - Conteúdo financeiro */}
          </div>
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
                Formandos Recentes
                <button className="text-xs text-brand-green font-bold hover:underline">
                  Ver todos
                </button>
              </h3>
              <div className="space-y-4">
                {recentStudents.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=ebf5ef&color=0e7038`}
                        className="w-10 h-10 rounded-full border-2 border-brand-green/10 shadow-sm"
                        alt="Student"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                          {s.name}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {s.course || "Curso"} • {s.when || "agora"}
                        </p>
                      </div>
                    </div>
                    <div className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200 uppercase">
                      ✓ Ativo
                    </div>
                  </div>
                ))}
                {recentStudents.length === 0 && (
                  <div className="text-xs text-slate-400 py-4">
                    Nenhuma inscrição recente.
                  </div>
                )}
              </div>
            </div>

            {/* Dica: Qualidade do Conteúdo */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl">
              {/* Decorative blob */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-green/20 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="bg-brand-green/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="text-brand-accent w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold mb-2">
                  Dica: Melhore a Qualidade
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  Formandos que recebem feedback nos primeiros 7 dias de estudo
                  têm 85% mais engajamento no curso e completam com sucesso.
                  Mantenha uma comunicação ativa!
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-5">
                  <div className="bg-white/10 rounded-lg p-2">
                    <p className="font-bold text-brand-green">
                      {stats.activeStudents}
                    </p>
                    <p className="text-slate-400">formandos ativos agora</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <p className="font-bold text-blue-400">
                      {stats.completionRate}%
                    </p>
                    <p className="text-slate-400">taxa de conclusão</p>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-brand-green hover:bg-brand-dark text-white rounded-lg font-bold text-xs transition-all shadow-lg shadow-black/30">
                  Acessar Mensagens
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
      <div
        className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${
          trendType === "up"
            ? "bg-emerald-50 text-emerald-600"
            : trendType === "down"
              ? "bg-red-50 text-red-600"
              : "bg-slate-50 text-slate-500"
        }`}
      >
        {trendType === "up" && <ArrowUpRight size={10} />}
        {trendType === "down" && <ArrowDownRight size={10} />}
        {trend}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-green transition-colors">
        {value}
      </h3>
    </div>
  </div>
);

const CourseRegistrationBar = ({ label, count, total, color }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <span className="text-xs font-bold text-slate-700 truncate max-w-[70%]">
        {label}
      </span>
      <span className="text-[10px] font-black text-slate-400">
        {count} FORMANDOS
      </span>
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

const Select = ({
  children,
  className,
  value,
  onValueChange,
  placeholder,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider
      value={{ value, onValueChange, isOpen, setIsOpen, placeholder }}
    >
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
      <ChevronDown
        className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );
};

const SelectValue = () => {
  const { value, placeholder } = React.useContext(SelectContext);
  return (
    <span className={!value ? "text-slate-400" : "text-slate-800 truncate"}>
      {value || placeholder}
    </span>
  );
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
  const {
    onValueChange,
    setIsOpen,
    value: selectedValue,
  } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      className={`relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 pl-3 pr-8 text-xs font-bold outline-none hover:bg-slate-50 transition-colors ${
        isSelected ? "bg-brand-green/5 text-brand-green" : "text-slate-600"
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
