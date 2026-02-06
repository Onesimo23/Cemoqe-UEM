
import { Course, NavLink } from './types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Cursos', href: '/cursos' },
  { label: 'Tutores', href: '/tutores' },
  { label: 'Categorias', href: '/categorias' },
  { label: 'Comunidade', href: '/comunidade' },
  { label: 'Sobre', href: '/sobre' },
];

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    category: 'Design',
    title: 'UX/UI Design Moderno e Acessível',
    instructor: 'Julia Santos',
    rating: 4.9,
    reviewCount: 2100,
    duration: '10h 20m',
    relevanceScore: 92,
    imageUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    badgeColor: 'bg-stone-100 text-stone-800',
    isActive: true
  },
  {
    id: '2',
    category: 'Design',
    title: 'Design de Identidade Visual',
    instructor: 'Ricardo Mello',
    rating: 4.8,
    reviewCount: 840,
    duration: '15h 45m',
    relevanceScore: 88,
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799312c95d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    badgeColor: 'bg-stone-100 text-stone-800',
    isActive: true
  },
  {
    id: '3',
    category: 'Design',
    title: 'Tipografia Avançada para Web',
    instructor: 'Carla Dantas',
    rating: 4.7,
    reviewCount: 1500,
    duration: '6h 20m',
    relevanceScore: 95,
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    badgeColor: 'bg-stone-100 text-stone-800',
    isActive: true
  },
  {
    id: '4',
    category: 'Design',
    title: 'Figma: Componentes e Design Systems',
    instructor: 'Lucas Pereira',
    rating: 4.9,
    reviewCount: 3200,
    duration: '12h 00m',
    relevanceScore: 98,
    imageUrl: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    badgeColor: 'bg-stone-100 text-stone-800',
    isActive: true
  },
  {
    id: '5',
    category: 'Design',
    title: 'Design Sprint: Do zero ao MVP',
    instructor: 'Julia Santos',
    rating: 4.6,
    reviewCount: 1100,
    duration: '8h 30m',
    relevanceScore: 85,
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    badgeColor: 'bg-stone-100 text-stone-800',
    isActive: true
  },
  {
    id: '6',
    category: 'Design',
    title: 'Psicologia das Cores no Design',
    instructor: 'Ana Costa',
    rating: 4.8,
    reviewCount: 620,
    duration: '4h 45m',
    relevanceScore: 90,
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    badgeColor: 'bg-stone-100 text-stone-800',
    isActive: true
  },
  {
    id: '7',
    category: 'Liderança',
    title: 'Liderança Avançada para Gestores',
    instructor: 'Marcos Silva',
    rating: 4.9,
    reviewCount: 1200,
    duration: '8h 30m',
    relevanceScore: 98,
    imageUrl: 'https://picsum.photos/id/1/400/250',
    badgeColor: 'bg-green-100 text-green-800',
    isActive: true
  },
  {
    id: '8',
    category: 'Desenvolvimento',
    title: 'Fundamentos de Python Profissional',
    instructor: 'Ana Costa',
    rating: 4.8,
    reviewCount: 3400,
    duration: '12h 15m',
    relevanceScore: 95,
    imageUrl: 'https://picsum.photos/id/2/400/250',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    isActive: true
  }
];
