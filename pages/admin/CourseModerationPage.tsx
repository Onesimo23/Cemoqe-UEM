import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
    CheckCircle2,
    Clock,
    Eye,
    Filter,
    Info,
    MessageSquare,
    PlayCircle,
    Search,
    X,
    XCircle
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { MOCK_COURSES } from "../../constants";
import AdminLayout from "../../layouts/AdminLayout";
import { db } from "../../services/firebase";
import { Course } from "../../types";

interface PendingCourse {
  id: string;
  title: string;
  instructor: string;
  category: string;
  duration: string;
  date: string;
  thumbnail: string;
}

const INITIAL_PENDING: PendingCourse[] = [
  {
    id: "p1",
    title: "Introdução ao TypeScript Avançado",
    instructor: "Carlos Mendes",
    category: "Desenvolvimento",
    duration: "12h",
    date: "Há 45 min",
    thumbnail:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "p2",
    title: "Criação de Personagens 3D no Blender",
    instructor: "Mariana Luz",
    category: "Design",
    duration: "18h",
    date: "Há 3 horas",
    thumbnail:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "p3",
    title: "Growth Hacking para Startups",
    instructor: "Felipe Neves",
    category: "Marketing",
    duration: "6h 30m",
    date: "Ontem",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "p4",
    title: "Finanças Pessoais e Investimentos",
    instructor: "Ana Paula",
    category: "Negócios",
    duration: "10h",
    date: "Há 2 dias",
    thumbnail:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  },
];

const CourseModerationPage: React.FC = () => {
  const [pendingList, setPendingList] = useState<PendingCourse[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  // Initialize pending list from localStorage or constant
  useEffect(() => {
    const savedPending = localStorage.getItem("eduprime_pending_moderation");
    if (savedPending) {
      setPendingList(JSON.parse(savedPending));
    } else {
      setPendingList(INITIAL_PENDING);
      localStorage.setItem(
        "eduprime_pending_moderation",
        JSON.stringify(INITIAL_PENDING),
      );
    }
  }, []);

  const updatePendingStorage = (newList: PendingCourse[]) => {
    setPendingList(newList);
    localStorage.setItem(
      "eduprime_pending_moderation",
      JSON.stringify(newList),
    );
  };

  const handleApprove = async (id: string) => {
    const courseToApprove = pendingList.find((p) => p.id === id);
    if (!courseToApprove) return;

    // 1. Get current catalog
    const savedCourses = localStorage.getItem("eduprime_courses");
    const catalog: Course[] = savedCourses
      ? JSON.parse(savedCourses)
      : MOCK_COURSES;

    // 2. Map pending to actual Course type
    const newCourse: Course = {
      id: courseToApprove.id,
      title: courseToApprove.title,
      instructor: courseToApprove.instructor,
      category: courseToApprove.category,
      duration: courseToApprove.duration,
      imageUrl: courseToApprove.thumbnail,
      rating: 5.0,
      reviewCount: 0,
      relevanceScore: 100,
      isActive: true,
      badgeColor: "bg-emerald-100 text-emerald-800",
    };

    // 3. Update Catalog in Storage
    const updatedCatalog = [newCourse, ...catalog];
    localStorage.setItem("eduprime_courses", JSON.stringify(updatedCatalog));

    // 4. Update Moderation List
    const updatedPending = pendingList.filter((item) => item.id !== id);
    updatePendingStorage(updatedPending);

    // 5. Registar log
    try {
      await addDoc(collection(db, "admin_logs"), {
        action: "Curso Aprovado",
        details: `Curso "${courseToApprove.title}" foi aprovado e adicionado ao catálogo`,
        targetUserName: courseToApprove.instructor,
        targetUserRole: "instructor",
        timestamp: serverTimestamp(),
        adminName: "Admin Panel",
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Erro ao registar log:", error);
    }

    triggerSuccess("Curso aprovado e adicionado ao catálogo!");
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim() || !rejectingId) return;

    // Simulate sending feedback to instructor
    const rejectedCourse = pendingList.find((p) => p.id === rejectingId);
    console.log(
      `Feedback enviado para ${rejectedCourse?.instructor}: ${rejectionReason}`,
    );

    // Save to a mock "notifications" system for the instructor
    const notifications = JSON.parse(
      localStorage.getItem("eduprime_notifications") || "[]",
    );
    notifications.push({
      id: Date.now(),
      targetInstructor: rejectedCourse?.instructor,
      type: "REJECTION",
      courseTitle: rejectedCourse?.title,
      reason: rejectionReason,
      date: new Date().toISOString(),
    });
    localStorage.setItem(
      "eduprime_notifications",
      JSON.stringify(notifications),
    );

    // Registar log
    try {
      await addDoc(collection(db, "admin_logs"), {
        action: "Curso Rejeitado",
        details: `Curso "${rejectedCourse?.title}" foi rejeitado. Motivo: ${rejectionReason}`,
        targetUserName: rejectedCourse?.instructor,
        targetUserRole: "instructor",
        timestamp: serverTimestamp(),
        adminName: "Admin Panel",
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Erro ao registar log:", error);
    }

    const updatedPending = pendingList.filter(
      (item) => item.id !== rejectingId,
    );
    updatePendingStorage(updatedPending);

    setRejectingId(null);
    setRejectionReason("");
    triggerSuccess("Conteúdo reprovado. Feedback enviado ao Tutor.");
  };

  const triggerSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Moderação de Conteúdos
            </h1>
            <p className="text-slate-500 mt-1">
              Revise e autorize novos cursos submetidos por instrutores.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
              <Clock className="w-4 h-4 text-brand-accent" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                {pendingList.length} Pendentes
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {showSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 size={18} />
            <p className="text-xs font-bold uppercase tracking-tight">
              {showSuccess}
            </p>
          </div>
        )}

        <div className="bg-brand-light/30 border border-brand-green/10 rounded-[32px] p-6 flex gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-brand-green shrink-0">
            <Info size={24} />
          </div>
          <div>
            <h4 className="font-bold text-brand-dark text-sm">
              Diretrizes da Plataforma
            </h4>
            <p className="text-xs text-brand-dark/60 mt-1 leading-relaxed font-medium">
              Verifique se o áudio está nítido, se as descrições seguem as
              regras de SEO e se os materiais complementares estão acessíveis.
              Aprovações levam o curso diretamente à vitrine pública e para a
              Gestão de Conteúdos.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar fila..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-slate-300 w-4 h-4" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Fila de Prioridade
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingList.length > 0 ? (
              pendingList.map((course) => (
                <ModerationRow
                  key={course.id}
                  course={course}
                  onApprove={() => handleApprove(course.id)}
                  onReject={() => setRejectingId(course.id)}
                />
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-slate-300">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2
                    size={40}
                    className="text-emerald-500 opacity-20"
                  />
                </div>
                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">
                  Tudo limpo por aqui!
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Nenhum curso aguardando moderação no momento.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Reprovação (ULTRA REDUZIDO) */}
      {rejectingId && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[380px] rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">
                Reprovar Conteúdo
              </h3>
              <button
                onClick={() => setRejectingId(null)}
                className="text-slate-300 hover:text-slate-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReject} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={12} /> Motivo do Feedback
                </label>
                <textarea
                  required
                  autoFocus
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: A qualidade do áudio no módulo 2 está abaixo do esperado..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="flex-1 h-12 bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-100 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 active:scale-95"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

// Added React.FC typing to allow standard props like 'key' when mapping over courses
const ModerationRow: React.FC<{
  course: PendingCourse;
  onApprove: () => void;
  onReject: () => void;
}> = ({ course, onApprove, onReject }) => (
  <div className="p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-slate-50/30 transition-colors group animate-in slide-in-from-left-4 duration-500">
    <div className="flex gap-6">
      <div className="w-32 h-20 bg-slate-900 rounded-2xl overflow-hidden relative group cursor-pointer shrink-0 border border-slate-100 shadow-sm">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-brand-green/60 text-white z-10">
          <Eye size={24} />
        </div>
        <img
          src={course.thumbnail}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
          alt=""
        />
        <div className="absolute inset-0 flex items-center justify-center text-white/50">
          <PlayCircle size={28} />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-brand-light text-brand-green rounded-md tracking-tighter">
            Novo Conteúdo
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
            {course.date}
          </span>
        </div>
        <h4 className="font-black text-slate-800 text-lg leading-tight group-hover:text-brand-green transition-colors">
          {course.title}
        </h4>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>{" "}
            {course.category}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>{" "}
            {course.instructor}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} /> {course.duration}
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
      <button
        onClick={onReject}
        className="flex items-center gap-2 bg-white border border-red-100 text-red-600 text-[10px] font-black uppercase px-5 py-3 rounded-2xl hover:bg-red-50 transition-all active:scale-95 shadow-sm"
      >
        <XCircle size={18} /> Reprovar
      </button>
      <button
        onClick={onApprove}
        className="flex items-center gap-2 bg-brand-green text-white text-[10px] font-black uppercase px-6 py-3 rounded-2xl hover:bg-brand-dark shadow-xl shadow-green-900/10 transition-all active:scale-95"
      >
        <CheckCircle2 size={18} /> Aprovar Curso
      </button>
    </div>
  </div>
);

export default CourseModerationPage;
