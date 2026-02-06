import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: 'student' | 'instructor' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, profile, loading } = useAuth();
  const currentUser = auth.currentUser;
  const isAuthenticated = !!(user || currentUser);
  const location = useLocation();

  if (loading) {
    // Para rotas do estudante, se já houver sessão no Auth, não bloqueie com spinner
    if (allowedRole === 'student' && isAuthenticated) {
      return <>{children}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redireciona para o login, guardando a página que tentou aceder
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Para rotas de Estudante, permitir acesso para qualquer utilizador autenticado
  if (allowedRole === 'student') {
    return <>{children}</>;
  }

  if (profile?.role !== allowedRole) {
    // Se logado mas com papel errado, volta para a home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
