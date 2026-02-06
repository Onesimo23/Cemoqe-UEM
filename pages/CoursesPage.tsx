
import React, { useEffect, useState } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { Course } from '../types';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Assumimos que cursos públicos têm isActive = true; evitamos índice composto usando um único where
    const q = query(collection(db, 'courses'), where('isActive', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      const list: Course[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          title: data?.title || 'Sem título',
          instructor: data?.instructor || '',
          category: data?.category || 'Geral',
          rating: typeof data?.rating === 'number' ? data.rating : 0,
          reviewCount: typeof data?.reviewCount === 'number' ? data.reviewCount : 0,
          duration: data?.duration || '0h',
          relevanceScore: typeof data?.relevanceScore === 'number' ? data.relevanceScore : 0,
          imageUrl: data?.imageUrl || 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=800&q=80&auto=format&fit=crop',
          badgeColor: data?.badgeColor || 'bg-stone-100 text-stone-800',
          isActive: data?.isActive !== false,
        } as Course;
      });
      setCourses(list);
    });
    return () => unsub();
  }, []);

  // Filter active courses first, then duplicate for demonstration if needed
  const activeCourses = courses.filter(c => c.isActive !== false);
  
  // Create a fuller list only with active courses
  const allCourses = [...activeCourses];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2 text-brand-green font-semibold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>Catálogo Acadêmico</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Explore Nossos Cursos</h1>
          <p className="text-gray-500 max-w-2xl text-lg">
            Descubra trilhas de conhecimento desenhadas para elevar sua carreira. 
            Do nível iniciante ao avançado, encontre o conteúdo ideal para você.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Search and Filters Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="O que você quer aprender hoje? (ex: Python, Gestão...)" 
              className="w-full pl-10 pr-4 py-3.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green shadow-sm text-gray-700 placeholder-gray-400 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 shadow-sm whitespace-nowrap transition-colors">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <select className="px-4 py-3.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 shadow-sm cursor-pointer outline-none focus:border-brand-green">
              <option>Mais Relevantes</option>
              <option>Mais Recentes</option>
              <option>Melhor Avaliados</option>
            </select>
          </div>
        </div>

        {/* Categories Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['Todos', 'Desenvolvimento', 'Negócios', 'Design', 'Data Science', 'Marketing', 'Liderança'].map((tag, idx) => (
            <button 
              key={tag}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                idx === 0 
                  ? 'bg-brand-dark text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-green hover:text-brand-green'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        {allCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {allCourses.map((course, index) => (
              <CourseCard key={`${course.id}-${index}`} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100 text-slate-400">
            Nenhum curso disponível com os filtros selecionados.
          </div>
        )}

        {/* Pagination Placeholder */}
        {allCourses.length > 0 && (
          <div className="mt-12 flex justify-center">
              <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-600 hover:border-brand-green hover:text-brand-green transition-colors">
                  Carregar mais cursos
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
