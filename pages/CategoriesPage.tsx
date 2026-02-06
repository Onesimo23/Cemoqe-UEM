import React from 'react';
import { 
  Code2, 
  Briefcase, 
  Palette, 
  BarChart3, 
  Cpu, 
  Camera, 
  Music, 
  Users,
  ArrowRight,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  {
    id: 'dev',
    title: 'Desenvolvimento',
    icon: <Code2 className="w-8 h-8 text-blue-600" />,
    description: 'Aprenda a programar do zero ou especialize-se em novas stacks.',
    courseCount: 320,
    topics: ['Python', 'React', 'Java', 'DevOps'],
    bg: 'bg-blue-50',
    border: 'hover:border-blue-200'
  },
  {
    id: 'business',
    title: 'Negócios',
    icon: <Briefcase className="w-8 h-8 text-emerald-600" />,
    description: 'Estratégias de gestão, empreendedorismo e liderança corporativa.',
    courseCount: 185,
    topics: ['Liderança', 'Agile', 'Vendas', 'Finanças'],
    bg: 'bg-emerald-50',
    border: 'hover:border-emerald-200'
  },
  {
    id: 'design',
    title: 'Design & UX',
    icon: <Palette className="w-8 h-8 text-purple-600" />,
    description: 'Crie interfaces incríveis e domine ferramentas visuais.',
    courseCount: 142,
    topics: ['Figma', 'Photoshop', 'UX Research', '3D'],
    bg: 'bg-purple-50',
    border: 'hover:border-purple-200'
  },
  {
    id: 'marketing',
    title: 'Marketing',
    icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
    description: 'Alcance seu público e construa marcas fortes no digital.',
    courseCount: 98,
    topics: ['SEO', 'Social Media', 'Branding', 'Ads'],
    bg: 'bg-orange-50',
    border: 'hover:border-orange-200'
  },
  {
    id: 'data',
    title: 'Data Science',
    icon: <Cpu className="w-8 h-8 text-cyan-600" />,
    description: 'Analise dados, crie modelos de IA e tome decisões assertivas.',
    courseCount: 86,
    topics: ['Machine Learning', 'SQL', 'Power BI', 'Excel'],
    bg: 'bg-cyan-50',
    border: 'hover:border-cyan-200'
  },
  {
    id: 'personal',
    title: 'Desenv. Pessoal',
    icon: <Users className="w-8 h-8 text-pink-600" />,
    description: 'Melhore sua produtividade, oratória e inteligência emocional.',
    courseCount: 110,
    topics: ['Produtividade', 'Oratória', 'Carreira', 'Foco'],
    bg: 'bg-pink-50',
    border: 'hover:border-pink-200'
  },
  {
    id: 'photo',
    title: 'Fotografia',
    icon: <Camera className="w-8 h-8 text-indigo-600" />,
    description: 'Domine a luz, composição e edição de imagens.',
    courseCount: 45,
    topics: ['Retratos', 'Edição', 'Iluminação', 'Vídeo'],
    bg: 'bg-indigo-50',
    border: 'hover:border-indigo-200'
  },
  {
    id: 'music',
    title: 'Música & Áudio',
    icon: <Music className="w-8 h-8 text-yellow-600" />,
    description: 'Teoria musical, instrumentos e produção de som.',
    courseCount: 38,
    topics: ['Produção', 'Violão', 'Piano', 'Teoria'],
    bg: 'bg-yellow-50',
    border: 'hover:border-yellow-200'
  }
];

const CategoriesPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-brand-light/30 border-b border-gray-100 py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200 mb-6">
            <Layers className="w-4 h-4 text-brand-green" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Áreas de Conhecimento</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            O que você quer <span className="text-brand-green">aprender</span> hoje?
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Navegue por nossa seleção de categorias e encontre a trilha perfeita para o seu momento profissional.
          </p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <Link 
              to="/cursos" 
              key={cat.id}
              className={`group flex flex-col p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white ${cat.border} relative overflow-hidden`}
            >
              {/* Icon Background Blob */}
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-150 ${cat.bg.replace('bg-', 'bg-')}`}></div>

              <div className={`w-14 h-14 rounded-xl ${cat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {cat.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-green transition-colors">
                {cat.title}
              </h3>
              
              <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">
                {cat.description}
              </p>

              <div className="border-t border-gray-50 pt-4 mb-4">
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Tópicos Populares</p>
                <div className="flex flex-wrap gap-2">
                  {cat.topics.map(topic => (
                    <span key={topic} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-medium text-gray-400">
                  {cat.courseCount} cursos
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-green group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;