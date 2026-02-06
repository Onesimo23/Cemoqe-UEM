
export interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  rating: number;
  reviewCount: number; // e.g., 1200 -> 1.2k
  duration: string;
  relevanceScore: number; // 0 to 100
  imageUrl: string;
  badgeColor?: string;
  isActive?: boolean; // Controls if it appears on public landing/course pages
}

export interface EnrolledCourse extends Course {
  progress: number; // 0 to 100
  totalLessons: number;
  completedLessons: number;
  lastAccessed?: string;
  nextLessonTitle?: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'article' | 'quiz';
  isCompleted: boolean;
  isLocked: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface NavLink {
  label: string;
  href: string;
}
