import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/AppStore';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { CoursesPage } from './pages/Courses';
import { ClassesPage } from './pages/Classes';
import { StudentsPage } from './pages/Students';
import { TasksPage } from './pages/Tasks';
import { EvaluationsPage } from './pages/Evaluations';
import { FinancePage } from './pages/Finance';
import { ProfilePage } from './pages/Profile';
import { AttendancePage } from './pages/Attendance';
import { ChecklistsPage } from './pages/Checklists';
import { CertificatesPage } from './pages/Certificates';
import { FirefightersPage } from './pages/Firefighters';
import { isSupabaseConfigured } from './services/supabase';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useStore();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Carregando sistema...</p>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { currentUser, loading } = useStore();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center border-l-4 border-yellow-500">
          <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Configuração Necessária</h1>
          <p className="text-gray-600 mb-4">
            O sistema não detectou as chaves do banco de dados <strong>Supabase</strong>.
          </p>
          <p className="text-sm text-gray-500 mb-6 text-left bg-gray-100 p-3 rounded">
            Você precisa configurar as variáveis de ambiente:<br />
            <code>SUPABASE_URL</code><br />
            <code>SUPABASE_KEY</code>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 w-full"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Conectando ao banco de dados...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
      <Route path="/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/evaluations" element={<ProtectedRoute><EvaluationsPage /></ProtectedRoute>} />
      <Route path="/checklists" element={<ProtectedRoute><ChecklistsPage /></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />
      <Route path="/firefighters" element={<ProtectedRoute><FirefightersPage /></ProtectedRoute>} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </StoreProvider>
  );
};

export default App;