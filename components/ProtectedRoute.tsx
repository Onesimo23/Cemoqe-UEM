import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../services/firebase";
import {
    DEFAULT_DASHBOARD,
    isValidRole,
    logUnauthorizedAccess
} from "../utils/routeProtection";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: "student" | "instructor" | "admin";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole,
}) => {
  const { user, profile, loading } = useAuth();
  const currentUser = auth.currentUser;
  const isAuthenticated = !!(user || currentUser);
  const location = useLocation();

  // Log de tentativa de acesso não autorizado
  useEffect(() => {
    if (
      !loading &&
      isAuthenticated &&
      profile?.role &&
      profile.role !== allowedRole &&
      allowedRole !== "student"
    ) {
      logUnauthorizedAccess(location.pathname, profile.role, user?.uid);
    }
  }, [
    loading,
    isAuthenticated,
    profile?.role,
    allowedRole,
    location.pathname,
    user?.uid,
  ]);

  // Enquanto carrega, mostra spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se não autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Validação do role do utilizador
  if (!profile?.role || !isValidRole(profile.role)) {
    // Role inválido, volta para home
    return <Navigate to="/" replace />;
  }

  // ⛔ VALIDAÇÃO CRÍTICA: Bloqueia acesso a rotas não autorizada
  // Para admin e instrutor, verifica o role exato
  if (allowedRole !== "student" && profile.role !== allowedRole) {
    logUnauthorizedAccess(location.pathname, profile.role, user?.uid);
    // Redireciona para o dashboard do seu role
    return <Navigate to={DEFAULT_DASHBOARD[profile.role]} replace />;
  }

  // Para estudantes, permite acesso apenas se for de fato estudante
  // (ou se tiver múltiplos roles e estudante for um deles no futuro)
  if (allowedRole === "student" && profile.role !== "student") {
    // Admin e instrutor não devem ter acesso a rotas de estudante
    logUnauthorizedAccess(location.pathname, profile.role, user?.uid);
    return <Navigate to={DEFAULT_DASHBOARD[profile.role]} replace />;
  }

  // Todas as validações passaram, permite acesso
  return <>{children}</>;
};

export default ProtectedRoute;
