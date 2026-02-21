import React from 'react';
import { Award, MessageSquare, Share2, Trophy, Calendar, ArrowRight, Heart } from 'lucide-react';

const branding = {
  appearance: {
    primaryColor: "#1a6e3c", // fundo verde escuro
    accentColor: "#89a022",  // verde claro/acento
  },
};

const CommunityPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Hero Section */}
      <section
        style={{ backgroundColor: branding.appearance.primaryColor }}
        className="text-white py-20 px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 mb-6">
            <Award style={{ color: branding.appearance.accentColor }} className="w-4 h-4" />
            <span className="text-sm tracking-wide font-medium">Comunidade Global</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Aprender é melhor{" "}
            <span style={{ color: branding.appearance.accentColor }}>juntos</span>
          </h1>

          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Conecte-se com milhares de estudantes, compartilhe projetos, tire dúvidas e
            cresça profissionalmente em nossa comunidade exclusiva.
          </p>

          <button
            style={{ backgroundColor: branding.appearance.accentColor }}
            className="text-black font-bold py-3.5 px-8 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
          >
            Entrar no Discord
          </button>
        </div>
      </section>

      {/* Stats Banner */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24">
          <div className="text-center">
            <p className="text-3xl font-bold text-brand-dark">15k+</p>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Membros Ativos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-brand-dark">500+</p>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Tópicos Diários</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-brand-dark">50+</p>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Grupos de Estudo</p>
          </div>
        </div>
      </div>

      {/* Forum Categories */}
      <div className="max-w-7xl mx-auto px-6 mt-16 mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Fóruns de Discussão</h2>
          <a href="#" className="text-brand-green font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Ver todos <ArrowRight className="w-4 h-4" />
          </a>
        </div>
          
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ForumCard 
            icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
            title="Dúvidas Técnicas"
            description="Espaço para perguntas sobre aulas, códigos e ferramentas."
            activeCount="128 online"
            color="bg-blue-50"
          />
          <ForumCard 
            icon={<Share2 className="w-6 h-6 text-purple-600" />}
            title="Showcase de Projetos"
            description="Compartilhe seu portfólio e receba feedback da comunidade."
            activeCount="45 online"
            color="bg-purple-50"
          />
          <ForumCard 
            icon={<Trophy className="w-6 h-6 text-orange-600" />}
            title="Carreira e Vagas"
            description="Dicas de currículo, preparação para entrevistas e oportunidades."
            activeCount="89 online"
            color="bg-orange-50"
          />
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <div className="inline-flex items-center gap-2 text-brand-green font-bold mb-4">
            <Calendar className="w-5 h-5" />
            <span>Agenda da Semana</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Eventos ao Vivo & Workshops</h2>
          <p className="text-gray-500 mb-8 text-lg">
            Participe de sessões exclusivas com especialistas da indústria. Masterclasses, revisões de código e networking.
          </p>
          <div className="space-y-4">
            <EventRow day="18" month="OUT" title="Masterclass: Arquitetura Limpa com React" time="19:00 - 21:00" />
            <EventRow day="22" month="OUT" title="Carreira Tech: Como negociar salário" time="18:30 - 19:30" />
            <EventRow day="25" month="OUT" title="Hackathon: Soluções para Sustentabilidade" time="09:00 - 18:00" />
          </div>
        </div>
        <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Students collaborating" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Top Contributors */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Contribuidores do Mês</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <img 
                src={`https://i.pravatar.cc/150?img=${10 + i}`} 
                alt="User avatar" 
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
              />
              <div>
                <p className="font-bold text-gray-900 text-sm">Alexandre M.</p>
                <p className="text-xs text-brand-green font-medium flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-current" /> 1.2k Likes
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sub-components
const ForumCard = ({ icon, title, description, activeCount, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
    <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{description}</p>
    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      {activeCount}
    </div>
  </div>
);

const EventRow = ({ day, month, title, time }: any) => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-brand-green/30 transition-colors">
    <div className="flex flex-col items-center justify-center bg-gray-50 w-16 h-16 rounded-lg border border-gray-200">
      <span className="text-xl font-bold text-brand-dark">{day}</span>
      <span className="text-xs font-bold text-gray-400">{month}</span>
    </div>
    <div>
      <h4 className="font-bold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{time}</p>
    </div>
    <button className="ml-auto text-brand-green hover:bg-brand-light p-2 rounded-full transition-colors">
      <ArrowRight className="w-5 h-5" />
    </button>
  </div>
);

export default CommunityPage;