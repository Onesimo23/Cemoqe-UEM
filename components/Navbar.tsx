import { GraduationCap, LayoutDashboard, Menu, X } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { NAV_LINKS } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { useBranding } from "../contexts/BrandingContext";
import { auth } from "../services/firebase";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { branding } = useBranding();
  const isAuthenticated = !!(user || auth.currentUser);

  return (
    <nav className="w-full bg-white py-4 px-6 md:px-12 sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          {branding.appearance.logoUrl ? (
            <img
              src={branding.appearance.logoUrl}
              alt="Logo"
              className="h-10 w-auto"
            />
          ) : (
            <div className="bg-brand-green p-1.5 rounded-lg">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
          )}
          <span
            className="text-xl font-bold text-brand-dark"
            style={{ color: branding.appearance.primaryColor }}
          >
            {branding.appearance.applicationName.split(" ")[0]}
            <span
              className="text-brand-accent"
              style={{ color: branding.appearance.accentColor }}
            >
              {branding.appearance.applicationName
                .split(" ")
                .slice(1)
                .join(" ")}
            </span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-gray-600 font-medium text-sm transition-colors"
              style={
                {
                  "--tw-text-opacity": "1",
                  color: branding.appearance.primaryColor,
                } as any
              }
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="text-white font-semibold py-2.5 px-6 rounded-md transition-colors text-sm shadow-md"
              style={{
                backgroundColor: branding.appearance.primaryColor,
                boxShadow: `0 4px 6px ${branding.appearance.primaryColor}40`,
              }}
            >
              Login
            </Link>
          ) : (
            <Link
              to="/aluno/dashboard"
              className="flex items-center gap-2 text-white font-bold py-2.5 px-6 rounded-md transition-all shadow-md"
              style={{
                backgroundColor: branding.appearance.primaryColor,
                boxShadow: `0 4px 6px ${branding.appearance.primaryColor}40`,
              }}
            >
              <LayoutDashboard className="w-4 h-4" />
              Área de Estudante
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="font-medium py-2 px-2 hover:bg-gray-50 rounded"
              style={{ color: branding.appearance.primaryColor }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-gray-100 my-1"></div>
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="text-white font-semibold py-3 rounded-md w-full text-center shadow-md"
              style={{
                backgroundColor: branding.appearance.primaryColor,
                boxShadow: `0 4px 6px ${branding.appearance.primaryColor}40`,
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          ) : (
            <Link
              to="/aluno/dashboard"
              className="text-white font-semibold py-3 rounded-md w-full text-center shadow-md flex items-center justify-center gap-2"
              style={{
                backgroundColor: branding.appearance.primaryColor,
                boxShadow: `0 4px 6px ${branding.appearance.primaryColor}40`,
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className="w-4 h-4" />
              Área de Estudante
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
