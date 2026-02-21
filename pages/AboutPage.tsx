import React from 'react';
import { Target, Shield, Zap, Globe, Award } from 'lucide-react';

const branding = {
  appearance: {
    primaryColor: "#1a6e3c",
    accentColor: "#89a022",
  },
};

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero */}
      <section
        style={{ backgroundColor: branding.appearance.primaryColor }}
        className="py-20 px-6 text-white relative overflow-hidden"
      >
        {/* Partículas decorativas */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Conteúdo central direto sobre o fundo */}
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full mb-6 border border-white/20">
            <Award
              style={{ color: branding.appearance.accentColor }}
              className="w-4 h-4"
            />
            <span className="text-sm tracking-wide font-medium">
              Educação Acessível
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            A UEM Cursos online nasceu com uma missão simples
          </h1>

          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Oferecer educação de qualidade, <span style={{ color: "#FFD700", fontWeight: "bold" }}>democratizar</span> o conhecimento e{" "}
            <span style={{ color: "#FFD700", fontWeight: "bold" }}>conectar profissionais</span> às oportunidades do mercado global.
          </p>
        </div>
      </section>

      {/* Conteúdo restante da página Sobre */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Team working on whiteboard"
              className="relative rounded-2xl shadow-xl z-10"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 text-brand-accent font-bold mb-2 uppercase tracking-wider text-sm">
              <Target className="w-4 h-4" />
              Nossa Missão
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Educação que Gera Impacto Real</h2>
            <div className="space-y-6 text-gray-600">
              <p>
                Acreditamos que a educação deve ser prática, relevante e contínua. Nossos cursos são desenhados não apenas para transmitir teoria, mas para construir competências aplicáveis imediatamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;