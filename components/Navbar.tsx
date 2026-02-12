import { LayoutDashboard, Menu, X } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { NAV_LINKS } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { useBranding } from "../contexts/BrandingContext";
import { auth } from "../services/firebase";
import { DEFAULT_DASHBOARD, isValidRole } from "../utils/routeProtection";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile } = useAuth();
  const { branding } = useBranding();
  const isAuthenticated = !!(user || auth.currentUser);

  /**
   * Obtém o link correto para o dashboard conforme o role
   */
  const getDashboardLink = (): string => {
    if (!profile || !isValidRole(profile.role)) {
      return "/aluno/dashboard"; // Fallback
    }
    return DEFAULT_DASHBOARD[profile.role];
  };

  /**
   * Obtém o label correto para o botão conforme o role
   */
  const getDashboardLabel = (): string => {
    if (!profile || !isValidRole(profile.role)) {
      return "Minha Área";
    }

    const labels: Record<typeof profile.role, string> = {
      admin: "Painel Administrativo",
      instructor: "Meus Cursos",
      student: "Meu Dashboard",
    };

    return labels[profile.role];
  };

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
            <div
              className="p-2 rounded-lg text-white font-black flex items-center justify-center h-10 w-10"
              style={{ backgroundColor: branding.appearance.primaryColor }}
            >
              {branding.appearance.logoText?.charAt(0) || "U"}
            </div>
          )}
          <div className="flex flex-col">
            <span
              className="font-bold text-sm leading-none"
              style={{
                color: branding.appearance.primaryColor,
                fontFamily: branding.appearance.fontFamily,
              }}
            >
              {branding.appearance.logoText ||
                branding.appearance.applicationName.split(" ")[0]}
            </span>
            {branding.appearance.logoSubtext && (
              <span
                className="text-xs font-bold leading-tight"
                style={{
                  color: branding.appearance.accentColor,
                  fontFamily: branding.appearance.fontFamily,
                }}
              >
                {branding.appearance.logoSubtext}
              </span>
            )}
          </div>
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
              to={getDashboardLink()}
              className="flex items-center gap-2 text-white font-bold py-2.5 px-6 rounded-md transition-all shadow-md"
              style={{
                backgroundColor: branding.appearance.primaryColor,
                boxShadow: `0 4px 6px ${branding.appearance.primaryColor}40`,
              }}
            >
              <LayoutDashboard className="w-4 h-4" />
              {getDashboardLabel()}
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
              to={getDashboardLink()}
              className="text-white font-semibold py-3 rounded-md w-full text-center shadow-md flex items-center justify-center gap-2"
              style={{
                backgroundColor: branding.appearance.primaryColor,
                boxShadow: `0 4px 6px ${branding.appearance.primaryColor}40`,
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className="w-4 h-4" />
              {getDashboardLabel()}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
