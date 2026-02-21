import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Award, MoreVertical, PlayCircle, Search } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import StudentLayout from "../../layouts/StudentLayout";
import { db } from "../../services/firebase";
import { EnrolledCourse } from "../../types";

// Tipagem para cartões derivados de inscrições
type CourseCard = EnrolledCourse & { lastAccessed?: string };

const MyCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "all" | "in-progress" | "completed"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<CourseCard[]>([]);

  useEffect(() => {
    if (!user?.uid) {
      console.log("❌ [MyCoursesPage] Usuário não autenticado");
      setItems([]);
      return;
    }

    console.log("✅ [MyCoursesPage] Usuário autenticado:", user.uid);

    let courseUnsubs: Array<() => void> = [];
    let subsUnsubs: Array<() => void> = [];

    const enrollsMap = new Map<string, { ts?: Date; fallback?: any }>();
    const coursesMap = new Map<string, any>();
    const progressMap = new Map<
      string,
      { completed: number; total: number; lastTs?: Date }
    >();

    const recompute = () => {
      const ids = new Set<string>([
        ...Array.from(enrollsMap.keys()),
        ...Array.from(coursesMap.keys()),
      ]);
      console.log(
        "🔄 [MyCoursesPage] Recompute chamado. IDs:",
        Array.from(ids),
        "EnrollsMap size:",
        enrollsMap.size,
        "CoursesMap size:",
        coursesMap.size,
      );
      const list: CourseCard[] = [];
      ids.forEach((cid) => {
        const course =
          coursesMap.get(cid) || enrollsMap.get(cid)?.fallback || {};
        const totalLessons = Array.isArray(course?.modules)
          ? course.modules.reduce(
              (acc: number, m: any) =>
                acc + (Array.isArray(m?.lessons) ? m.lessons.length : 0),
              0,
            )
          : course?.totalLessons || 0;
        const prog = progressMap.get(cid) || {
          completed: 0,
          total: totalLessons,
        };
        const progress =
          totalLessons > 0
            ? Math.min(100, Math.round((prog.completed / totalLessons) * 100))
            : 0;
        const lastTs = prog.lastTs || enrollsMap.get(cid)?.ts;
        const lastAccessed = lastTs
          ? new Intl.RelativeTimeFormat("pt-PT", { numeric: "auto" }).format(
              Math.round((lastTs.getTime() - Date.now()) / 3600000),
              "hour",
            )
          : undefined;
        list.push({
          id: cid,
          title: course?.title || "Curso",
          category: course?.category || "Geral",
          imageUrl:
            course?.imageUrl ||
            course?.image ||
            "https://via.placeholder.com/320x180.png?text=Curso",
          instructor: course?.instructor || "Instrutor",
          progress,
          totalLessons,
          completedLessons: prog.completed,
          lastAccessed,
        } as CourseCard);
      });
      list.sort((a, b) => {
        const aTs = (
          progressMap.get(a.id)?.lastTs ||
          enrollsMap.get(a.id)?.ts ||
          new Date(0)
        ).getTime();
        const bTs = (
          progressMap.get(b.id)?.lastTs ||
          enrollsMap.get(b.id)?.ts ||
          new Date(0)
        ).getTime();
        return bTs - aTs;
      });
      console.log(
        "📋 [MyCoursesPage] Lista final de cursos:",
        list.length,
        list,
      );
      setItems(list);
    };

    const subscribeByCourse = (courseIds: string[]) => {
      console.log(
        "🎯 [MyCoursesPage] subscribeByCourse chamado com IDs:",
        courseIds,
      );
      courseUnsubs.forEach((u) => u());
      courseUnsubs = [];
      subsUnsubs.forEach((u) => u());
      subsUnsubs = [];
      if (courseIds.length === 0) {
        console.log("⚠️ [MyCoursesPage] Nenhum course_id fornecido!");
        setItems([]);
        return;
      }

      const chunk = (arr: string[], size: number) =>
        Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
          arr.slice(i * size, i * size + size),
        );
      const chunks = chunk(courseIds, 10);
      console.log("📦 [MyCoursesPage] Chunks criados:", chunks);

      chunks.forEach((ids) => {
        const qC = query(
          collection(db, "courses"),
          where("__name__", "in", ids),
        );
        console.log("🔍 [MyCoursesPage] Buscando cursos com IDs:", ids);
        const uc = onSnapshot(qC, (snap) => {
          console.log(
            "📚 [MyCoursesPage] Snapshot de cursos recebido:",
            snap.size,
            "documentos",
          );
          snap.docs.forEach((d) => {
            console.log("  - Curso encontrado:", d.id, d.data());
            coursesMap.set(d.id, d.data());
          });
          recompute();
        });
        courseUnsubs.push(uc);

        // Procurar submissões (uploads de exercícios)
        const qS = query(
          collection(db, "submissions"),
          where("user_uid", "==", user.uid),
          where("course_id", "in", ids),
        );
        console.log(
          "📤 [MyCoursesPage] Buscando submissões para courses:",
          ids,
        );
        const us = onSnapshot(qS, (snap) => {
          console.log("📨 [MyCoursesPage] Submissões encontradas:", snap.size);
          const byCourse = new Map<string, Set<string>>();
          const lastByCourse = new Map<string, Date>();
          snap.docs.forEach((d) => {
            const data: any = d.data();
            const cid = data?.course_id || data?.courseId;
            const lid = data?.lesson_id || data?.lessonId || d.id;
            console.log(
              "    📝 Submissão - course_id:",
              cid,
              "lesson_id:",
              lid,
            );
            if (!cid) return;
            if (!byCourse.has(cid)) byCourse.set(cid, new Set());
            byCourse.get(cid)!.add(String(lid));
            const ts: Date | null = data?.submittedAt?.toDate
              ? data.submittedAt.toDate()
              : data?.createdAt?.toDate
                ? data.createdAt.toDate()
                : null;
            if (ts) {
              const prev = lastByCourse.get(cid);
              if (!prev || ts.getTime() > prev.getTime())
                lastByCourse.set(cid, ts);
            }
          });
          ids.forEach((cid) => {
            const completed = byCourse.get(cid)?.size || 0;
            const total = Array.isArray(coursesMap.get(cid)?.modules)
              ? coursesMap
                  .get(cid)
                  .modules.reduce(
                    (acc: number, m: any) =>
                      acc + (Array.isArray(m?.lessons) ? m.lessons.length : 0),
                    0,
                  )
              : coursesMap.get(cid)?.totalLessons || 0;
            console.log(
              `    📊 Course ${cid}: ${completed}/${total} (submissões)`,
            );
            progressMap.set(cid, {
              completed,
              total,
              lastTs: lastByCourse.get(cid),
            });
          });
          recompute();
        });
        subsUnsubs.push(us);

        // Procurar aulas marcadas como concluídas (lesson-completions) ✅ NOVO
        const qLC = query(
          collection(db, "lesson-completions"),
          where("user_uid", "==", user.uid),
          where("course_id", "in", ids),
        );
        console.log(
          "✅ [MyCoursesPage] Buscando aulas concluídas para courses:",
          ids,
        );
        const ulc = onSnapshot(qLC, (snap) => {
          console.log(
            "✔️ [MyCoursesPage] Aulas concluídas encontradas:",
            snap.size,
          );
          const byCourse = new Map<string, Set<string>>();
          const lastByCourse = new Map<string, Date>();
          snap.docs.forEach((d) => {
            const data: any = d.data();
            const cid = data?.course_id;
            const lid = data?.lesson_id;
            console.log("    ✓ Conclusão - course_id:", cid, "lesson_id:", lid);
            if (!cid || !lid) return;
            if (!byCourse.has(cid)) byCourse.set(cid, new Set());
            byCourse.get(cid)!.add(String(lid));
            const ts: Date | null = data?.completedAt?.toDate
              ? data.completedAt.toDate()
              : null;
            if (ts) {
              const prev = lastByCourse.get(cid);
              if (!prev || ts.getTime() > prev.getTime())
                lastByCourse.set(cid, ts);
            }
          });
          ids.forEach((cid) => {
            const prevProg = progressMap.get(cid);
            const completed = byCourse.get(cid)?.size || 0;
            const total = Array.isArray(coursesMap.get(cid)?.modules)
              ? coursesMap
                  .get(cid)
                  .modules.reduce(
                    (acc: number, m: any) =>
                      acc + (Array.isArray(m?.lessons) ? m.lessons.length : 0),
                    0,
                  )
              : coursesMap.get(cid)?.totalLessons || 0;
            // Usar o máximo entre submissions e lesson-completions
            const maxCompleted = Math.max(prevProg?.completed || 0, completed);
            console.log(
              `    📊 Course ${cid}: ${maxCompleted}/${total} (completions)`,
            );
            progressMap.set(cid, {
              completed: maxCompleted,
              total,
              lastTs: lastByCourse.get(cid) || prevProg?.lastTs,
            });
          });
          recompute();
        });
        subsUnsubs.push(ulc);
      });
    };

    const handleEnrollSnap = (snap: any) => {
      console.log(
        "👤 [MyCoursesPage] handleEnrollSnap chamado:",
        snap.size,
        "inscrições encontradas",
      );
      const ids = new Set<string>();
      snap.docs.forEach((d: any) => {
        const data: any = d.data();
        console.log("  📝 Inscrição encontrada:", d.id, data);
        const cid = data?.course_id || data?.courseId;
        console.log("    - course_id/courseId:", cid);
        const ts: Date | null = data?.enrolledAt?.toDate
          ? data.enrolledAt.toDate()
          : data?.createdAt?.toDate
            ? data.createdAt.toDate()
            : null;
        if (!cid) {
          console.log("    ❌ Sem course_id! Pulando este documento");
          return;
        }
        ids.add(cid);
        enrollsMap.set(cid, {
          ts: ts || undefined,
          fallback: {
            title: data?.course_title,
            category: data?.category,
            imageUrl: data?.imageUrl,
            instructor: data?.instructor,
            totalLessons: data?.totalLessons,
          },
        });
      });
      console.log(
        "🎓 [MyCoursesPage] Total de IDs extraídos:",
        Array.from(ids),
      );
      recompute();
      subscribeByCourse(Array.from(ids));
    };

    console.log("🔗 [MyCoursesPage] Configurando listeners...");
    const u1 = onSnapshot(
      query(collection(db, "enrollments"), where("user_uid", "==", user.uid)),
      handleEnrollSnap,
      (error) =>
        console.error("❌ [MyCoursesPage] Erro no listener u1:", error),
    );
    const u2 = onSnapshot(
      query(collection(db, "enrollments"), where("userId", "==", user.uid)),
      handleEnrollSnap,
      (error) =>
        console.error("❌ [MyCoursesPage] Erro no listener u2:", error),
    );
    return () => {
      console.log("🧹 [MyCoursesPage] Limpando listeners...");
      u1();
      u2();
      courseUnsubs.forEach((u) => u());
      subsUnsubs.forEach((u) => u());
    };
  }, [user?.uid]);

  // Filter logic
  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (activeTab === "completed") return course.progress === 100;
      if (activeTab === "in-progress")
        return course.progress > 0 && course.progress < 100;
      return true; // 'all'
    });
  }, [items, searchQuery, activeTab]);

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Meus Cursos
          </h1>
          <p className="text-gray-500">
            Gerencie seu aprendizado e acompanhe seu progresso.
          </p>
        </div>

        {/* Toolbar (Tabs & Search) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <TabButton
              active={activeTab === "all"}
              onClick={() => setActiveTab("all")}
              label="Todos"
              count={items.length}
            />
            <TabButton
              active={activeTab === "in-progress"}
              onClick={() => setActiveTab("in-progress")}
              label="Em Andamento"
            />
            <TabButton
              active={activeTab === "completed"}
              onClick={() => setActiveTab("completed")}
              label="Concluídos"
            />
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar curso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseProgressCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Nenhum curso encontrado
            </h3>
            <p className="text-gray-500 text-sm">
              Tente ajustar seus filtros ou buscar por outro termo.
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

// --- Sub-components ---

const TabButton = ({ active, onClick, label, count }: any) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2
      ${
        active
          ? "bg-white text-brand-dark shadow-sm"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
      }
    `}
  >
    {label}
    {count !== undefined && (
      <span
        className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-brand-green/10 text-brand-green" : "bg-gray-200 text-gray-600"}`}
      >
        {count}
      </span>
    )}
  </button>
);

// Added React.FC typing to fix 'key' prop error in map
const CourseProgressCard: React.FC<{ course: EnrolledCourse }> = ({
  course,
}) => {
  const isCompleted = course.progress === 100;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group overflow-hidden">
      {/* Image Area */}
      <Link
        to={`/aluno/sala-de-aula/${course.id}`}
        className="relative h-40 w-full overflow-hidden block"
      >
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isCompleted ? (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
              <Award className="w-3 h-3" /> Concluído
            </span>
          ) : course.progress > 0 ? (
            <span className="bg-white/90 backdrop-blur-sm text-brand-dark text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              Em andamento
            </span>
          ) : (
            <span className="bg-gray-800/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              Não iniciado
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {course.category}
          </span>
          <button className="text-gray-300 hover:text-gray-600">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <Link to={`/aluno/sala-de-aula/${course.id}`} className="block">
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-brand-green transition-colors">
            {course.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-4">{course.instructor}</p>

        {/* Progress Section */}
        <div className="mt-auto pt-4 border-t border-gray-50">
          {!isCompleted ? (
            <>
              <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                <span>{course.progress}% concluído</span>
                <span>
                  {course.completedLessons}/{course.totalLessons} aulas
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                <div
                  className="bg-brand-green h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <Link
                to={`/aluno/sala-de-aula/${course.id}`}
                className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-bold py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm"
              >
                <PlayCircle className="w-4 h-4" />
                {course.progress > 0 ? "Continuar Aula" : "Iniciar Curso"}
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium mb-4 bg-green-50 p-2 rounded-lg">
                <Award className="w-4 h-4" />
                <span>Certificado disponível</span>
              </div>
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Ver Certificado
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCoursesPage;
