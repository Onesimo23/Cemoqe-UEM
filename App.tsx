
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CategoriesPage from './pages/CategoriesPage';
import CommunityPage from './pages/CommunityPage';
import AboutPage from './pages/AboutPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import InstructorsPage from './pages/InstructorsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Student Pages
import StudentDashboardPage from './pages/student/DashboardPage';
import StudentCoursesPage from './pages/student/MyCoursesPage';
import StudentClassroomPage from './pages/student/CoursePlayerPage';
import StudentForumPage from './pages/student/ForumPage';
import StudentCertificatesPage from './pages/student/CertificatesPage';
import StudentCertificateViewPage from './pages/student/CertificateViewPage';
import StudentSettingsPage from './pages/student/SettingsPage';
import StudentFeedbackPage from './pages/student/FeedbackPage';
import StudentEnrollmentPage from './pages/student/EnrollmentPage';
import StudentHistoryPage from './pages/student/HistoryPage';

// Instructor Pages
import InstructorDashboardPage from './pages/instructor/DashboardPage';
import InstructorCoursesPage from './pages/instructor/MyCoursesPage';
import InstructorCourseEditorPage from './pages/instructor/CourseEditorPage';
import InstructorStudentsPage from './pages/instructor/MyStudentsPage';
import InstructorFinancePage from './pages/instructor/FinanceiroPage';
import InstructorQuestionsPage from './pages/instructor/QuestionsPage';
import InstructorReportsPage from './pages/instructor/ReportsPage';
import InstructorSettingsPage from './pages/instructor/SettingsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminUsersPage from './pages/admin/UsersManagementPage';
import AdminTutorsPage from './pages/admin/TutorsManagementPage';
import AdminContentsPage from './pages/admin/ContentManagementPage';
import AdminModerationPage from './pages/admin/CourseModerationPage';
import AdminPermissionsPage from './pages/admin/PermissionsPage';
import AdminAnalyticsPage from './pages/admin/AnalyticsPage';
import AdminSettingsPage from './pages/admin/SettingsPage';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-white">
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/cursos" element={<PublicLayout><CoursesPage /></PublicLayout>} />
          <Route path="/cursos/:id" element={<PublicLayout><CourseDetailsPage /></PublicLayout>} />
          <Route path="/tutores" element={<PublicLayout><InstructorsPage /></PublicLayout>} />
          <Route path="/categorias" element={<PublicLayout><CategoriesPage /></PublicLayout>} />
          <Route path="/comunidade" element={<PublicLayout><CommunityPage /></PublicLayout>} />
          <Route path="/sobre" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/termos" element={<PublicLayout><TermsPage /></PublicLayout>} />
          <Route path="/privacidade" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/cadastro" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/recuperar-senha" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />

          {/* Student Protected Routes */}
          <Route path="/aluno/dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboardPage /></ProtectedRoute>} />
          <Route path="/aluno/cursos" element={<ProtectedRoute allowedRole="student"><StudentCoursesPage /></ProtectedRoute>} />
          <Route path="/aluno/historico" element={<ProtectedRoute allowedRole="student"><StudentHistoryPage /></ProtectedRoute>} />
          <Route path="/aluno/forum" element={<ProtectedRoute allowedRole="student"><StudentForumPage /></ProtectedRoute>} />
          <Route path="/aluno/certificados" element={<ProtectedRoute allowedRole="student"><StudentCertificatesPage /></ProtectedRoute>} />
          <Route path="/aluno/certificado/:id" element={<ProtectedRoute allowedRole="student"><StudentCertificateViewPage /></ProtectedRoute>} />
          <Route path="/aluno/configuracoes" element={<ProtectedRoute allowedRole="student"><StudentSettingsPage /></ProtectedRoute>} />
          <Route path="/aluno/feedback" element={<ProtectedRoute allowedRole="student"><StudentFeedbackPage /></ProtectedRoute>} />
          <Route path="/aluno/inscricao/:id" element={<ProtectedRoute allowedRole="student"><StudentEnrollmentPage /></ProtectedRoute>} />
          <Route path="/aluno/sala-de-aula/:id" element={<ProtectedRoute allowedRole="student"><StudentClassroomPage /></ProtectedRoute>} />

          {/* Instructor Routes */}
          <Route path="/instrutor/dashboard" element={<ProtectedRoute allowedRole="instructor"><InstructorDashboardPage /></ProtectedRoute>} />
          <Route path="/instrutor/cursos" element={<ProtectedRoute allowedRole="instructor"><InstructorCoursesPage /></ProtectedRoute>} />
          <Route path="/instrutor/cursos/novo" element={<ProtectedRoute allowedRole="instructor"><InstructorCourseEditorPage /></ProtectedRoute>} />
          <Route path="/instrutor/cursos/editar/:id" element={<ProtectedRoute allowedRole="instructor"><InstructorCourseEditorPage /></ProtectedRoute>} />
          <Route path="/instrutor/alunos" element={<ProtectedRoute allowedRole="instructor"><InstructorStudentsPage /></ProtectedRoute>} />
          <Route path="/instrutor/financeiro" element={<ProtectedRoute allowedRole="instructor"><InstructorFinancePage /></ProtectedRoute>} />
          <Route path="/instrutor/duvidas" element={<ProtectedRoute allowedRole="instructor"><InstructorQuestionsPage /></ProtectedRoute>} />
          <Route path="/instrutor/relatorios" element={<ProtectedRoute allowedRole="instructor"><InstructorReportsPage /></ProtectedRoute>} />
          <Route path="/instrutor/configuracoes" element={<ProtectedRoute allowedRole="instructor"><InstructorSettingsPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/usuarios" element={<ProtectedRoute allowedRole="admin"><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/tutores" element={<ProtectedRoute allowedRole="admin"><AdminTutorsPage /></ProtectedRoute>} />
          <Route path="/admin/conteudos" element={<ProtectedRoute allowedRole="admin"><AdminContentsPage /></ProtectedRoute>} />
          <Route path="/admin/moderacao" element={<ProtectedRoute allowedRole="admin"><AdminModerationPage /></ProtectedRoute>} />
          <Route path="/admin/permissoes" element={<ProtectedRoute allowedRole="admin"><AdminPermissionsPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRole="admin"><AdminAnalyticsPage /></ProtectedRoute>} />
          <Route path="/admin/configuracoes" element={<ProtectedRoute allowedRole="admin"><AdminSettingsPage /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
