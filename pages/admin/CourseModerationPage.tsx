import {
  collection,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { db } from "../../services/firebase";
import { Course } from "../../types";

const CourseModerationPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [approvalModal, setApprovalModal] = useState<{
    action: "approve" | "reject";
    courseId: string;
    courseTitle: string;
    instructor: string;
  } | null>(null);

  // Listener em tempo real para cursos
  useEffect(() => {
    setLoading(true);
    const coursesRef = collection(db, "courses");
    
    const unsubscribe = onSnapshot(
      coursesRef,
      (snapshot) => {
        const coursesList: Course[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          coursesList.push({
            id: doc.id,
            title: data.title || "Sem título",
            instructor: data.instructor || "Sem instrutor",
            category: data.category || "Geral",
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
            duration: data.duration || "0h",
            relevanceScore: data.relevanceScore || 0,
            imageUrl: data.imageUrl || "",
            isActive: data.isActive !== false,
            badgeColor: data.badgeColor || "bg-stone-100 text-stone-800",
            approvalStatus: data.approvalStatus || "pending",
          } as Course);
        });
        
        setCourses(coursesList);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar cursos:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApproveCourse = async (
    courseId: string,
    courseTitle: string
  ) => {
    try {
      await updateDoc(doc(db, "courses", courseId), {
        approvalStatus: "approved",
        updatedAt: serverTimestamp(),
      });
      showToast(`✅ Curso "${courseTitle}" aprovado!`, "success");
      setApprovalModal(null);
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      showToast("Erro ao aprovar curso.", "error");
      setApprovalModal(null);
    }
  };

  const handleRejectCourse = async (
    courseId: string,
    courseTitle: string
  ) => {
    try {
      await updateDoc(doc(db, "courses", courseId), {
        approvalStatus: "rejected",
        updatedAt: serverTimestamp(),
      });
      showToast(`✗ Curso "${courseTitle}" rejeitado.`, "success");
      setApprovalModal(null);
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      showToast("Erro ao rejeitar curso.", "error");
      setApprovalModal(null);
    }
  };

  const filteredCourses = courses.filter(
    (course) => course.approvalStatus === tab
  );

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Moderação de Cursos
            </h1>
            <p className="text-slate-500 mt-1">
              Aprove ou rejeite cursos submetidos pelos instrutores
            </p>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              {courses.filter((c) => c.approvalStatus === "pending").length}{" "}
              Pendentes
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {(["pending", "approved", "rejected"] as const).map((tab_name) => (
              <button
                key={tab_name}
                onClick={() => setTab(tab_name)}
                className={`flex-1 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                  tab === tab_name
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab_name === "pending"
                  ? `Pendentes (${courses.filter((c) => c.approvalStatus === "pending").length})`
                  : tab_name === "approved"
                  ? `Aprovados (${courses.filter((c) => c.approvalStatus === "approved").length})`
                  : `Rejeitados (${courses.filter((c) => c.approvalStatus === "rejected").length})`}
                {tab === tab_name && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-400 mt-4 text-sm font-medium">
                Carregando cursos...
              </p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle size={48} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">
                {tab === "pending"
                  ? "Nenhum curso pendente"
                  : tab === "approved"
                  ? "Nenhum curso aprovado"
                  : "Nenhum curso rejeitado"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="font-black text-slate-900 mb-2">
                        {course.title}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-600">
                          <span className="font-bold">Instrutor:</span>{" "}
                          {course.instructor}
                        </p>
                        <p className="text-slate-600">
                          <span className="font-bold">Categoria:</span>{" "}
                          {course.category}
                        </p>
                        <p className="text-slate-600">
                          <span className="font-bold">Duração:</span>{" "}
                          {course.duration}
                        </p>
                      </div>
                    </div>
                    {course.imageUrl && (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                  </div>

                  {course.approvalStatus === "pending" && (
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() =>
                          setApprovalModal({
                            action: "reject",
                            courseId: course.id,
                            courseTitle: course.title,
                            instructor: course.instructor,
                          })
                        }
                        className="flex-1 h-10 bg-red-50 text-red-600 border border-red-200 font-black uppercase text-xs tracking-widest rounded-lg hover:bg-red-100 transition-all"
                      >
                        Rejeitar
                      </button>
                      <button
                        onClick={() =>
                          setApprovalModal({
                            action: "approve",
                            courseId: course.id,
                            courseTitle: course.title,
                            instructor: course.instructor,
                          })
                        }
                        className="flex-1 h-10 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                      >
                        Aprovar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação */}
      {approvalModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[340px] rounded-[32px] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div
              className={`w-12 h-12 ${
                approvalModal.action === "approve"
                  ? "bg-blue-50 text-blue-500"
                  : "bg-red-50 text-red-500"
              } rounded-2xl flex items-center justify-center mx-auto mb-6`}
            >
              {approvalModal.action === "approve" ? (
                <CheckCircle size={24} />
              ) : (
                <X size={24} />
              )}
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">
              {approvalModal.action === "approve"
                ? "Aprovar Curso?"
                : "Rejeitar Curso?"}
            </h3>
            <p className="text-xs text-slate-500 mb-8 leading-relaxed font-medium px-2">
              {approvalModal.action === "approve"
                ? `Você está aprovando "${approvalModal.courseTitle}" do instrutor ${approvalModal.instructor}. O instrutor poderá ativar o curso.`
                : `Você está rejeitando "${approvalModal.courseTitle}". O instrutor não poderá ativar este curso.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setApprovalModal(null)}
                className="flex-1 h-11 bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (approvalModal.action === "approve") {
                    handleApproveCourse(
                      approvalModal.courseId,
                      approvalModal.courseTitle
                    );
                  } else {
                    handleRejectCourse(
                      approvalModal.courseId,
                      approvalModal.courseTitle
                    );
                  }
                }}
                className={`flex-1 h-11 ${
                  approvalModal.action === "approve"
                    ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                    : "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20"
                } text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all`}
              >
                {approvalModal.action === "approve" ? "Sim, Aprovar" : "Sim, Rejeitar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[200] px-6 py-3 rounded-xl font-bold text-sm shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {toast.message}
        </div>
      )}
    </AdminLayout>
  );
};

export default CourseModerationPage;
