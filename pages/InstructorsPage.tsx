import React from 'react';
import { Star, Users, PlayCircle, Linkedin, Twitter, Globe, ArrowRight, Award } from 'lucide-react';

const INSTRUCTORS = [
  {
    id: 1,
    name: 'Julia Santos',
    role: 'Senior Product Designer',
    company: 'Ex-Google',
    bio: 'Especialista em UX/UI com foco em acessibilidade e Design Systems. Já liderou equipes em grandes startups do Vale do Silício.',
    students: '15.4k',
    courses: 12,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    tags: ['Design', 'UX Research', 'Figma']
  },
  {
    id: 2,
    name: 'Marcos Silva',
    role: 'CTO & Agile Coach',
    company: 'TechFlow',
    bio: 'Mais de 15 anos transformando equipes de desenvolvimento. Autor best-seller sobre Liderança Técnica e Cultura Ágil.',
    students: '8.2k',
    courses: 5,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    tags: ['Liderança', 'Agile', 'Gestão']
  },
  {
    id: 3,
    name: 'Ana Costa',
    role: 'Lead Data Scientist',
    company: 'DataCorp',
    bio: 'Doutora em Ciência da Computação. Ensina Python e Machine Learning de forma descomplicada para milhares de alunos.',
    students: '22k',
    courses: 8,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    tags: ['Python', 'Data Science', 'AI']
  },
  {
    id: 4,
    name: 'Ricardo Mello',
    role: 'Diretor de Arte',
    company: 'Studio Mello',
    bio: 'Premiado internacionalmente em Branding e Identidade Visual. Traz a experiência do mercado publicitário para a sala de aula.',
    students: '5.1k',
    courses: 4,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    tags: ['Branding', 'Design Gráfico', 'Photoshop']
  },
  {
    id: 5,
    name: 'Carla Dantas',
    role: 'Frontend Architect',
    company: 'WebSolutions',
    bio: 'Apaixonada por performance web e React. Contribuidora ativa de projetos Open Source e palestrante em conferências.',
    students: '10.5k',
    courses: 9,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    tags: ['Frontend', 'React', 'CSS']
  },
  {
    id: 6,
    name: 'Lucas Pereira',
    role: 'Product Manager',
    company: 'Fintech X',
    bio: 'Especialista em estratégia de produto e growth. Ajuda profissionais a migrarem para a área de Gestão de Produtos.',
    students: '7.8k',
    courses: 6,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    tags: ['Produto', 'Negócios', 'Estratégia']
  }
];

const InstructorsPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-brand-dark text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <Award className="w-4 h-4 text-brand-accent" />
            <span className="text-sm font-medium tracking-wide">Excelência Garantida</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Aprenda com quem <span className="text-brand-accent">lidera</span> o mercado
          </h1>
          <p className="text-brand-light/80 text-lg md:text-xl max-w-2xl mx-auto">
            Nossos tutores são especialistas selecionados a dedo, atuantes nas maiores empresas de tecnologia e inovação do mundo.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {INSTRUCTORS.map((instructor) => (
            <div key={instructor.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
              
              {/* Profile Header */}
              <div className="p-6 pb-0 flex items-start gap-4">
                <img 
                  src={instructor.image} 
                  alt={instructor.name} 
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 group-hover:border-brand-light transition-colors"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-green transition-colors">{instructor.name}</h3>
                  <p className="text-sm font-medium text-brand-dark mb-0.5">{instructor.role}</p>
                  <p className="text-xs text-gray-400 font-medium">{instructor.company}</p>
                </div>
              </div>

              {/* Bio */}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {instructor.tags.map(tag => (
                    <span key={tag} className="text-xs font-semibold bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {instructor.bio}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between py-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-bold">{instructor.students}</span>
                    <span className="text-xs">alunos</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-brand-accent fill-current" />
                    <span className="font-bold">{instructor.rating}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <PlayCircle className="w-4 h-4 text-gray-400" />
                    <span className="font-bold">{instructor.courses}</span>
                    <span className="text-xs">cursos</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 mt-auto">
                  <div className="flex gap-3">
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-sky-500 transition-colors">
                      <Twitter className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-800 transition-colors">
                      <Globe className="w-5 h-5" />
                    </button>
                  </div>
                  <button className="text-sm font-bold text-brand-green flex items-center gap-1 hover:gap-2 transition-all">
                    Ver Perfil <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Become an Instructor CTA */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto bg-brand-green rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="p-10 md:p-14 md:w-3/5 text-white flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Torne-se um Tutor na EduPrime</h2>
            <p className="text-brand-light/90 text-lg mb-8 leading-relaxed">
              Compartilhe seu conhecimento, impacte milhares de carreiras e gere uma nova fonte de renda. Junte-se à nossa comunidade de especialistas.
            </p>
            <button className="bg-brand-accent hover:bg-yellow-400 text-brand-dark font-bold py-4 px-8 rounded-xl w-fit transition-colors shadow-lg shadow-black/10">
              Começar a Ensinar Hoje
            </button>
          </div>
          <div className="md:w-2/5 bg-gray-200 relative min-h-[300px]">
            <img 
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Instructor teaching" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-brand-dark/20 mix-blend-multiply"></div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default InstructorsPage;