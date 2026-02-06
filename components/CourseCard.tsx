import React from 'react';
import { Star, Clock } from 'lucide-react';
import { Course } from '../types';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // Format review count (e.g., 1200 -> 1.2k)
  const formatReviews = (count: number) => {
    return count > 999 ? `${(count / 1000).toFixed(1)}k` : count;
  };

  return (
    <Link to={`/cursos/${course.id}`} className="block h-full">
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full group">
        {/* Image Container */}
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={course.imageUrl} 
            alt={course.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-md shadow-sm ${course.badgeColor || 'bg-white text-gray-800'}`}>
            {course.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2 group-hover:text-brand-green transition-colors">
            {course.title}
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            Com <span className="text-gray-700 font-medium">{course.instructor}</span>
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-between mt-auto mb-4 text-xs font-medium text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-brand-accent fill-current" />
              <span className="text-gray-900 font-bold text-sm">{course.rating}</span>
              <span className="text-gray-400">({formatReviews(course.reviewCount)})</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{course.duration}</span>
            </div>
          </div>

          {/* Relevance Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-brand-green">{course.relevanceScore}% Relevante</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className="bg-brand-green h-1.5 rounded-full" 
                style={{ width: `${course.relevanceScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;