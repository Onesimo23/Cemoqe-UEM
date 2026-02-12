import React from 'react';
import { Target, Shield, Zap, Globe, Award, CheckCircle2 } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="relative py-20 px-6 bg-gradient-to-b from-brand-light/30 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark mb-6 leading-tight">
            Transformando o futuro através da <span className="text-brand-green">educação acessível</span>
          </h1>
          <p className="text-gray-500 text-xl leading-relaxed max-w-2xl mx-auto">
            A UEM Cursos online nasceu com uma missão simples: democratizar o conhecimento de alta qualidade e conectar profissionais às oportunidades do mercado global.
          </p>
        </div>
      </div>

      {/* Image & Mission */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-accent/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-brand-green/20 rounded-full blur-2xl"></div>
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
              <ul className="space-y-3">
                <ListItem text="Metodologia baseada em projetos reais" />
                <ListItem text="Instrutores que são líderes no mercado" />
                <ListItem text="Certificados reconhecidos pela indústria" />
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-brand-dark py-20 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatBox number="50k+" label="Alunos Formados" />
          <StatBox number="120+" label="Cursos Disponíveis" />
          <StatBox number="4.8" label="Nota Média" />
          <StatBox number="25" label="Países Alcançados" />
        </div>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-brand-dark mb-4">Nossos Valores</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Os pilares que sustentam cada aula, cada linha de código e cada interação em nossa plataforma.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ValueCard
            icon={<Shield className="w-8 h-8 text-brand-green" />}
            title="Excelência e Qualidade"
            description="Não aceitamos o 'bom o suficiente'. Buscamos a excelência em cada detalhe do conteúdo."
          />
          <ValueCard
            icon={<Globe className="w-8 h-8 text-blue-500" />}
            title="Acessibilidade Global"
            description="Conhecimento sem fronteiras. Trabalhamos para que nossa plataforma chegue a todos."
          />
          <ValueCard
            icon={<Zap className="w-8 h-8 text-brand-accent" />}
            title="Inovação Constante"
            description="O mercado muda rápido, e nós também. Mantemos nosso currículo sempre atualizado."
          />
        </div>
      </div>

    </div>
  );
};

const ListItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3">
    <CheckCircle2 className="w-5 h-5 text-brand-green flex-shrink-0" />
    <span>{text}</span>
  </li>
);

const StatBox = ({ number, label }: { number: string, label: string }) => (
  <div>
    <p className="text-4xl md:text-5xl font-bold mb-2 text-brand-accent">{number}</p>
    <p className="text-brand-light/70 font-medium">{label}</p>
  </div>
);

const ValueCard = ({ icon, title, description }: any) => (
  <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all text-center md:text-left">
    <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 mx-auto md:mx-0">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </div>
);

export default AboutPage;
