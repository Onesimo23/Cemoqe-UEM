import React from 'react';
import { GraduationCap, Linkedin, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <GraduationCap className="text-brand-green w-6 h-6" />
          <span className="text-lg font-bold text-brand-dark">
            Edu<span className="text-brand-green">Prime</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 font-medium">
          <Link to="/termos" className="hover:text-brand-green transition-colors">Termos</Link>
          <Link to="/privacidade" className="hover:text-brand-green transition-colors">Privacidade</Link>
          <a href="#" className="hover:text-brand-green transition-colors">Ajuda</a>
          <a href="#" className="hover:text-brand-green transition-colors">Carreiras</a>
        </div>

        {/* Socials */}
        <div className="flex gap-4">
          <SocialButton icon={<Linkedin className="w-4 h-4" />} />
          <SocialButton icon={<Instagram className="w-4 h-4" />} />
          <SocialButton icon={<Twitter className="w-4 h-4" />} />
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-12">
        © 2024 EduPrime Learning Platform. Todos os direitos reservados.
      </div>
    </footer>
  );
};

const SocialButton: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-brand-green hover:text-white transition-colors">
    {icon}
  </button>
);

export default Footer;