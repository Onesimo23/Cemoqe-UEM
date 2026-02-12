import {
   AlertCircle,
   ChevronRight,
   Eye,
   EyeOff,
   Filter,
   FolderPlus,
   Hash,
   Layers,
   Plus,
   Power,
   Search,
   Trash2,
   TrendingUp,
   User,
   X
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { MOCK_COURSES } from "../../constants";
import AdminLayout from "../../layouts/AdminLayout";
import { Course } from "../../types";

interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: "1", name: "Design", count: 6, color: "bg-purple-100 text-purple-700" },
  {
    id: "2",
    name: "Liderança",
    count: 1,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "3",
    name: "Desenvolvimento",
    count: 1,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "4",
    name: "Marketing",
    count: 0,
    color: "bg-orange-100 text-orange-700",
  },
];

const ContentManagementPage: React.FC = () => {
  const location = useLocation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Course Form State
  const [newCourse, setNewCourse] = useState({
    title: "",
    instructor: "",
    category: "Design",
    relevanceScore: 90,
  });

  // Sync with LocalStorage for persistence and moderation updates
  useEffect(() => {
    const savedCourses = localStorage.getItem("uem_courses");
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      setCourses(MOCK_COURSES);
      localStorage.setItem("uem_courses", JSON.stringify(MOCK_COURSES));
    }
  }, []);

  const updatePersistentCourses = (updatedList: Course[]) => {
    setCourses(updatedList);
    localStorage.setItem("uem_courses", JSON.stringify(updatedList));
  };

  // Handle navigation from other pages (like Tutors)
  useEffect(() => {
    if (location.state?.instructorFilter) {
      setSearchQuery(location.state.instructorFilter);
    }
  }, [location]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: Category = {
      id: Date.now().toString(),
      name: newCatName,
      count: 0,
      color: "bg-slate-100 text-slate-700",
    };

    setCategories([...categories, newCat]);
    setNewCatName("");
    setIsCategoryModalOpen(false);
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title.trim()) return;

    const courseToAdd: Course = {
      id: Math.random().toString(36).substr(2, 9),
      title: newCourse.title,
      instructor: newCourse.instructor || "UEM Cursos online Tutor",
      category: newCourse.category,
      rating: 5.0,
      reviewCount: 0,
      duration: "0h",
      relevanceScore: Number(newCourse.relevanceScore),
      imageUrl: `https://picsum.photos/seed/${Math.random()}/800/600`,
      isActive: true,
      badgeColor: "bg-stone-100 text-stone-800",
    };

    updatePersistentCourses([courseToAdd, ...courses]);
    setIsCourseModalOpen(false);
    setNewCourse({
      title: "",
      instructor: "",
      category: "Design",
      relevanceScore: 90,
    });
  };

  const handleDeleteCourse = (id: string) => {
    const updated = courses.filter((c) => c.id !== id);
    updatePersistentCourses(updated);
    setDeleteConfirmId(null);
  };

  const toggleCourseStatus = (id: string) => {
    const updated = courses.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c,
    );
    updatePersistentCourses(updated);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Gestão de Conteúdos
            </h1>
            <p className="text-slate-500 mt-1">
              Controle total sobre o catálogo de cursos e taxonomia da
              plataforma.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <FolderPlus size={18} /> Nova Categoria
            </button>
            <button
              onClick={() => setIsCourseModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-green text-white font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-2xl hover:bg-brand-dark transition-all shadow-lg shadow-green-900/10 active:scale-95"
            >
              <Plus size={18} /> Novo Curso
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar: Categories */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                  <Layers size={16} className="text-brand-green" /> Categorias
                </h3>
                <span className="text-[10px] font-black text-slate-300 uppercase">
                  {categories.length} Total
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all group ${!selectedCategory ? "bg-brand-green text-white shadow-lg shadow-green-900/20" : "hover:bg-slate-50 text-slate-600"}`}
                >
                  <span className="text-xs font-bold">Todas as Áreas</span>
                  <ChevronRight
                    size={14}
                    className={
                      !selectedCategory
                        ? "text-white"
                        : "text-slate-300 group-hover:text-brand-green"
                    }
                  />
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all group ${selectedCategory === cat.name ? "bg-brand-green text-white shadow-lg shadow-green-900/20" : "hover:bg-slate-50 text-slate-600"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold">{cat.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${selectedCategory === cat.name ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green"}`}
                    >
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50">
                <div className="bg-brand-light/30 rounded-2xl p-4 flex gap-3">
                  <AlertCircle
                    size={16}
                    className="text-brand-green shrink-0"
                  />
                  <p className="text-[10px] font-bold text-brand-dark leading-tight">
                    Categorias vazias são ocultadas da vitrine pública
                    automaticamente.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp size={80} />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-brand-accent mb-4">
                Dica de Gestão
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Cursos com "Design" no título convertem 15% mais em buscas
                orgânicas este mês.
              </p>
            </div>
          </div>

          {/* Main: Courses Table */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center bg-slate-50/30">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Pesquisar por título do curso ou nome do instrutor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 h-12 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-green/5 focus:border-brand-green transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-slate-300 w-4 h-4" />
                  <select className="h-12 bg-white border border-slate-200 rounded-2xl px-4 text-xs font-bold text-slate-600 outline-none cursor-pointer">
                    <option>Mais Recentes</option>
                    <option>Maior Rating</option>
                    <option>Preço (Crescente)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Conteúdo
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Score
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <tr
                          key={course.id}
                          className={`hover:bg-slate-50/40 transition-colors group ${!course.isActive ? "bg-slate-50/30" : ""}`}
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img
                                  src={course.imageUrl}
                                  className={`w-16 h-10 rounded-xl object-cover shadow-sm transition-opacity ${!course.isActive ? "opacity-40 grayscale" : ""}`}
                                  alt=""
                                />
                                {!course.isActive && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <EyeOff
                                      size={14}
                                      className="text-slate-900"
                                    />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p
                                  className={`font-bold text-sm transition-colors ${course.isActive ? "text-slate-900 group-hover:text-brand-green" : "text-slate-400 italic"}`}
                                >
                                  {course.title}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                  Instrutor: {course.instructor}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                                course.isActive
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : "bg-slate-100 text-slate-400 border border-slate-200"
                              }`}
                            >
                              {course.isActive ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex flex-col items-center">
                              <span
                                className={`text-sm font-black ${course.isActive ? "text-slate-700" : "text-slate-300"}`}
                              >
                                {course.relevanceScore}%
                              </span>
                              <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${course.isActive ? "bg-brand-green" : "bg-slate-300"}`}
                                  style={{ width: `${course.relevanceScore}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2 transition-opacity">
                              <button
                                onClick={() => toggleCourseStatus(course.id)}
                                className={`p-2.5 rounded-xl border transition-all shadow-sm active:scale-95 ${
                                  course.isActive
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                                    : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                                }`}
                                title={
                                  course.isActive
                                    ? "Desativar da Vitrine"
                                    : "Ativar na Vitrine"
                                }
                              >
                                <Power size={18} />
                              </button>
                              <a
                                href={`#/cursos/${course.id}`}
                                target="_blank"
                                className="p-2.5 bg-white text-slate-400 hover:text-blue-500 border border-slate-100 rounded-xl transition-all shadow-sm"
                                title="Ver Página Pública"
                              >
                                <Eye size={18} />
                              </a>
                              <button
                                onClick={() => setDeleteConfirmId(course.id)}
                                className="p-2.5 bg-white text-slate-400 hover:text-red-500 border border-slate-100 rounded-xl transition-all shadow-sm"
                                title="Remover Curso"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-300">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="font-bold text-slate-400 uppercase text-xs tracking-widest">
                              Nenhum curso encontrado
                            </p>
                            <button
                              onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory(null);
                              }}
                              className="mt-4 text-[10px] font-black uppercase text-brand-green hover:underline"
                            >
                              Limpar Filtros
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-8 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Mostrando {filteredCourses.length} de {courses.length}{" "}
                  conteúdos cadastrados
                </p>
                <div className="flex gap-2">
                  <button className="px-6 h-10 text-[10px] font-black uppercase text-slate-300 bg-white border border-slate-200 rounded-xl cursor-not-allowed transition-all">
                    Anterior
                  </button>
                  <button className="px-6 h-10 text-[10px] font-black uppercase text-brand-green bg-white border border-brand-green/20 rounded-xl hover:bg-brand-green hover:text-white transition-all shadow-sm">
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Nova Categoria */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                  Criar Categoria
                </h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 transition-all hover:rotate-90"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddCategory} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Ex: Inteligência Artificial"
                    className="w-full px-5 h-14 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 h-14 text-xs font-black uppercase text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-14 bg-brand-green text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-brand-dark transition-all shadow-xl shadow-green-900/10"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Novo Curso */}
        {isCourseModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                  Novo Curso
                </h3>
                <button
                  onClick={() => setIsCourseModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 transition-all hover:rotate-90"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddCourse} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Título do Conteúdo
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newCourse.title}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, title: e.target.value })
                    }
                    placeholder="Ex: Maestria em Backend com Node.js"
                    className="w-full px-5 h-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nome do Instrutor
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={newCourse.instructor}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          instructor: e.target.value,
                        })
                      }
                      placeholder="Ex: Carlos Mendes"
                      className="w-full pl-11 pr-5 h-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-brand-green focus:ring-4 focus:ring-brand-green/5 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Categoria
                    </label>
                    <select
                      value={newCourse.category}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, category: e.target.value })
                      }
                      className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-green"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Hash size={10} /> Score de Relevância
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newCourse.relevanceScore}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          relevanceScore: Number(e.target.value),
                        })
                      }
                      className="w-full px-5 h-12 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-brand-green"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="flex-1 h-14 text-xs font-black uppercase text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-14 bg-brand-green text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-brand-dark transition-all shadow-xl shadow-green-900/10"
                  >
                    Publicar Agora
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirmação de Exclusão */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-[340px] rounded-[32px] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">
                Remover curso?
              </h3>
              <p className="text-xs text-slate-500 mb-8 leading-relaxed font-medium px-2">
                Esta ação é irreversível e o conteúdo será retirado da vitrine
                pública.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 h-11 bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-100 transition-all active:scale-95"
                >
                  Manter
                </button>
                <button
                  onClick={() => handleDeleteCourse(deleteConfirmId)}
                  className="flex-1 h-11 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 active:scale-95"
                >
                  Sim, remover
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContentManagementPage;
